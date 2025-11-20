<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppSkeleton from '@/components/ui/AppSkeleton.vue'
import { useProjectsStore, type Project } from '@/stores/projects'
import { useToast } from '@/composables/useToast'

const projectsStore = useProjectsStore()
const route = useRoute()
const router = useRouter()
const { showToast } = useToast()

const projectId = computed(() => route.params.id as string)

const isRefreshing = ref(false)
const isPreviewLoading = ref(false)
const previewError = ref<string | null>(null)

const project = computed(() => {
  if (!projectId.value) return null
  return projectsStore.getProjectById(projectId.value) ?? null
})

const statusLabels: Record<Project['status'], string> = {
  ready: 'Готов',
  processing: 'Обработка',
  draft: 'Черновик',
}

const getStatusClass = (status: Project['status']) => {
  if (status === 'ready') return 'status--success'
  if (status === 'processing') return 'status--processing'
  return 'status--draft'
}

type PreviewState =
  | 'loading'
  | 'missing'
  | 'processing'
  | 'not-public'
  | 'no-index'
  | 'error'
  | 'ready'

const canShowPreview = computed(() => previewState.value === 'ready')

const previewState = computed<PreviewState>(() => {
  if (projectsStore.isLoading && !project.value) return 'loading'
  if (!project.value) return 'missing'
  if (project.value.status !== 'ready') return 'processing'
  if (!project.value.isPublic || !project.value.publicUrl) return 'not-public'
  if (!project.value.fileCount) return 'no-index'
  if (previewError.value) return 'error'
  return 'ready'
})

const previewMessageMap: Record<PreviewState, string> = {
  loading: 'Загружаем сведения о проекте…',
  missing: 'Проект не найден или был удалён.',
  processing: 'Проект ещё обрабатывается. Проверьте немного позже.',
  'not-public': 'Проект скрыт или публичный URL ещё не сформирован.',
  'no-index': 'Не найден index.html. Перезагрузите ZIP и убедитесь, что файл существует.',
  error: 'Не удалось отобразить предпросмотр. Попробуйте обновить страницу.',
  ready: '',
}

const previewStateMessage = computed(() => previewMessageMap[previewState.value])

const loadProject = async (force = false) => {
  if (!projectId.value) return
  try {
    if (force) {
      isRefreshing.value = true
    }
    await projectsStore.fetchProjectById(projectId.value, { force })
    previewError.value = null
  } catch {
    if (!project.value) {
      await router.replace({ name: 'dashboard' })
    }
  } finally {
    isRefreshing.value = false
  }
}

const handleRefresh = async () => {
  await loadProject(true)
}

const handleDelete = async () => {
  if (!project.value) return
  const confirmed = confirm(`Удалить проект «${project.value.name}»?`)
  if (!confirmed) return

  try {
    await projectsStore.deleteProject(project.value.id)
    await router.push({ name: 'dashboard' })
  } catch {
    // обработка в сторе
  }
}

const handleTogglePublic = async () => {
  if (!project.value) return
  try {
    await projectsStore.togglePublic(project.value.id)
    if (!project.value.isPublic) {
      previewError.value = null
    }
  } catch {
    // обработка в сторе
  }
}

const handleCopyUrl = async () => {
  if (!project.value?.publicUrl) {
    showToast('Публичный URL недоступен', 'warning')
    return
  }
  try {
    await navigator.clipboard.writeText(project.value.publicUrl)
    showToast('Ссылка скопирована в буфер', 'success')
  } catch {
    showToast('Не удалось скопировать ссылку', 'error')
  }
}

const handlePreviewLoad = async () => {
  isPreviewLoading.value = false
  previewError.value = null
  // Отслеживаем просмотр при успешной загрузке iframe
  if (project.value?.id && project.value?.isPublic) {
    await projectsStore.trackView(project.value.id)
  }
}

const handlePreviewError = () => {
  isPreviewLoading.value = false
  previewError.value = 'Ошибка загрузки iframe'
}

const setupPreview = () => {
  isPreviewLoading.value = !!project.value?.publicUrl
  previewError.value = null
}

onMounted(async () => {
  await loadProject()
  setupPreview()
})

watch(projectId, async () => {
  await loadProject(true)
  setupPreview()
})

watch(
  () => project.value?.publicUrl,
  () => {
    setupPreview()
  },
)

const handleBackClick = () => {
  void router.push({ name: 'dashboard' })
}
</script>

<template>
  <section class="project">
    <header class="project__header">
      <button class="back-link" type="button" @click="handleBackClick">← К списку проектов</button>
      <p class="eyebrow">Project ID: {{ projectId }}</p>
      <h1>{{ project?.name ?? 'Загрузка проекта…' }}</h1>
      <p v-if="project" class="muted">
        Статус:
        <span :class="['status-chip', getStatusClass(project.status)]">
          {{ statusLabels[project.status] }}
        </span>
        • Обновлён {{ projectsStore.formatDate(project.updatedAt) }}
      </p>
    </header>

    <div v-if="projectsStore.isLoading && !project" class="project__skeleton">
      <AppSkeleton width="100%" height="8rem" />
    </div>

    <template v-else-if="project">
      <div class="meta-grid">
        <article class="meta-card">
          <h3>Публичная ссылка</h3>
          <p v-if="project.publicUrl" class="mono url" @click="handleCopyUrl">
            {{ project.publicUrl }}
          </p>
          <p v-else class="mono muted">URL пока недоступен</p>
        </article>
        <article class="meta-card">
          <h3>Размер архива</h3>
          <p>{{ projectsStore.formatFileSize(project.size) }}</p>
        </article>
        <article class="meta-card">
          <h3>Файлов</h3>
          <p>{{ project.fileCount ?? '—' }}</p>
        </article>
        <article class="meta-card">
          <h3>Просмотры</h3>
          <p>{{ project.viewCount ?? '—' }}</p>
        </article>
        <article class="meta-card">
          <h3>Создан</h3>
          <p>{{ projectsStore.formatDate(project.createdAt) }}</p>
        </article>
        <article class="meta-card">
          <h3>Публикация</h3>
          <p>{{ project.isPublic ? 'Публичный' : 'Приватный' }}</p>
        </article>
      </div>

      <div class="actions">
        <button
          class="btn btn--primary"
          type="button"
          :disabled="projectsStore.isLoading || isRefreshing"
          @click="handleRefresh"
        >
          {{ isRefreshing ? 'Обновляем…' : 'Обновить данные' }}
        </button>
        <button
          class="btn"
          type="button"
          :disabled="projectsStore.isLoading"
          @click="handleTogglePublic"
        >
          {{ project.isPublic ? 'Скрыть из публичного доступа' : 'Опубликовать проект' }}
        </button>
        <button
          class="btn btn--ghost danger"
          type="button"
          :disabled="projectsStore.isLoading"
          @click="handleDelete"
        >
          Удалить проект
        </button>
      </div>

      <section class="preview">
        <header>
          <h2>Просмотр проекта</h2>
          <p class="muted">Здесь отображается `index.html` опубликованного архива.</p>
        </header>

        <div v-if="!canShowPreview" class="preview__fallback">
          <p>{{ previewStateMessage }}</p>
          <button
            v-if="previewState === 'not-public'"
            class="btn btn--primary"
            type="button"
            :disabled="projectsStore.isLoading"
            @click="handleTogglePublic"
          >
            Опубликовать
          </button>
          <button
            v-else-if="previewState === 'error'"
            class="btn"
            type="button"
            :disabled="projectsStore.isLoading"
            @click="handleRefresh"
          >
            Повторить
          </button>
        </div>

        <div v-else class="preview__frame">
          <div v-if="isPreviewLoading" class="preview__loading">
            <AppSkeleton width="100%" height="100%" />
          </div>
          <iframe
            v-show="!isPreviewLoading"
            :src="project.publicUrl ?? undefined"
            title="Project preview"
            loading="lazy"
            sandbox="allow-same-origin allow-scripts allow-pointer-lock allow-popups allow-forms"
            @load="handlePreviewLoad"
            @error="handlePreviewError"
          ></iframe>
        </div>
      </section>
    </template>

    <div v-else class="project__empty">
      <p>Проект не найден.</p>
      <RouterLink class="back-link" :to="{ name: 'dashboard' }">Вернуться к списку</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.project {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.project__header .eyebrow {
  color: var(--text-secondary);
}

.back-link {
  border: none;
  background: none;
  color: var(--accent-primary);
  cursor: pointer;
  padding: 0;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.meta-grid {
  margin-top: 0.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.meta-card {
  border: 1px solid var(--border-subtle);
  padding: 1.25rem;
  border-radius: 1rem;
  background: var(--surface-card);
}

.actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn {
  border-radius: 0.75rem;
  border: 1px solid var(--border-strong);
  padding: 0.65rem 1.4rem;
  cursor: pointer;
  background: var(--surface-muted);
  color: var(--text-primary);
  transition: opacity 0.2s;
}

.btn--primary {
  background: var(--accent-primary);
  color: #04111f;
  border-color: var(--accent-primary);
}

.btn--ghost {
  background: transparent;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.danger {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.35);
}

.muted {
  color: var(--text-secondary);
}

.status-chip {
  border-radius: 999px;
  padding: 0.2rem 0.75rem;
}

.status--success {
  background: #c5f5e7;
  color: #035043;
}

.status--processing {
  background: #dbeafe;
  color: #1e40af;
}

.status--draft {
  background: #ffe9c2;
  color: #613b00;
}

.url {
  cursor: pointer;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.preview {
  border: 1px solid var(--border-strong);
  border-radius: 1rem;
  padding: 1.5rem;
  background: var(--surface-card);
}

.preview__frame {
  margin-top: 1rem;
  position: relative;
  min-height: 360px;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  background: var(--surface-muted);
}

.preview__frame iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.preview__loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: var(--surface-muted);
}

.preview__fallback {
  border: 1px dashed var(--border-subtle);
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
  color: var(--text-secondary);
}

.project__skeleton {
  margin-top: 1rem;
}

.project__empty {
  text-align: center;
  color: var(--text-secondary);
  border: 1px dashed var(--border-subtle);
  border-radius: 1rem;
  padding: 2rem;
}

@media (max-width: 640px) {
  .actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
