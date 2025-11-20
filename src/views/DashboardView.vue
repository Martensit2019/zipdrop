<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore, type Project } from '@/stores/projects'
import { useToast } from '@/composables/useToast'
import AppSkeleton from '@/components/ui/AppSkeleton.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import UploadForm from '@/components/dashboard/UploadForm.vue'

const router = useRouter()
const projectsStore = useProjectsStore()
const { showToast } = useToast()
const isUploadModalOpen = ref(false)
const isSuccessModalOpen = ref(false)
const uploadSuccessData = ref<{ name: string; publicUrl: string } | null>(null)

const getStatusLabel = (status: Project['status']): string => {
  const labels = {
    ready: 'Готов',
    processing: 'Обработка',
    draft: 'Черновик',
  }
  return labels[status]
}

const getStatusClass = (status: Project['status']): string => {
  if (status === 'ready') return 'status--success'
  if (status === 'processing') return 'status--processing'
  return 'status--draft'
}

const handleDelete = async (project: Project) => {
  if (!confirm(`Удалить проект "${project.name}"?`)) return
  try {
    await projectsStore.deleteProject(project.id)
  } catch (error) {
    // Ошибка уже обработана в store
  }
}

const handleCopyUrl = async (url: string | null) => {
  if (!url) {
    showToast('Публичный URL недоступен', 'warning')
    return
  }
  try {
    await navigator.clipboard.writeText(url)
    showToast('Ссылка скопирована в буфер обмена', 'success')
  } catch (error) {
    showToast('Не удалось скопировать ссылку', 'error')
  }
}

const handleTogglePublic = async (project: Project) => {
  try {
    await projectsStore.togglePublic(project.id)
  } catch (error) {
    // Ошибка уже обработана в store
  }
}

const handleOpenProject = (projectId: string) => {
  router.push({ name: 'project', params: { id: projectId } })
}

const openUploadModal = () => {
  isUploadModalOpen.value = true
}

const closeUploadModal = () => {
  isUploadModalOpen.value = false
}

const closeSuccessModal = () => {
  isSuccessModalOpen.value = false
  uploadSuccessData.value = null
}

const handleUploadSuccess = (payload: { name: string; publicUrl: string }) => {
  uploadSuccessData.value = payload
  isUploadModalOpen.value = false
  isSuccessModalOpen.value = true
}

const handleOpenSuccessUrl = () => {
  if (!uploadSuccessData.value?.publicUrl) return
  const targetUrl = uploadSuccessData.value.publicUrl
  if (typeof window !== 'undefined' && window?.open) {
    window.open(targetUrl, '_blank', 'noopener')
  } else if (typeof globalThis !== 'undefined' && 'open' in globalThis && typeof globalThis.open === 'function') {
    globalThis.open(targetUrl, '_blank')
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') {
    return
  }

  if (isSuccessModalOpen.value) {
    closeSuccessModal()
    return
  }

  if (isUploadModalOpen.value) {
    closeUploadModal()
  }
}

const updateBodyOverflow = (value: boolean) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = value ? 'hidden' : ''
}

const isAnyModalOpen = computed(() => isUploadModalOpen.value || isSuccessModalOpen.value)

watch(isAnyModalOpen, value => {
  updateBodyOverflow(value)
})

onMounted(() => {
  const init = async () => {
    if (projectsStore.projects.length === 0) {
      try {
        await projectsStore.fetchProjects()
      } catch (error) {
        // Ошибка уже обработана в store
      }
    }
  }

  init()
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', handleKeydown)
  }
})

onBeforeUnmount(() => {
  updateBodyOverflow(false)
  if (typeof document !== 'undefined') {
    document.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<template>
  <section class="dashboard">
    <header>
      <h1>Проекты</h1>
      <p v-if="!projectsStore.isLoading && projectsStore.projects.length === 0">
        У вас пока нет проектов. Загрузите ZIP-файл, чтобы начать.
      </p>
    </header>

    <div class="dashboard__actions">
      <button type="button" class="btn btn--primary dashboard__add-button" @click="openUploadModal">
        Добавить проект
      </button>
    </div>

    <Teleport to="body">
      <div v-if="isUploadModalOpen" class="modal-overlay" @click.self="closeUploadModal">
        <div class="modal">
          <header class="modal__header">
            <div>
              <h2 class="modal__title">Добавить проект</h2>
              <p class="modal__subtitle">Загрузите ZIP-файл с проектом</p>
            </div>
            <button type="button" class="modal__close" aria-label="Закрыть" @click="closeUploadModal">
              ✕
            </button>
          </header>
          <div class="modal__body">
            <UploadForm @upload-success="handleUploadSuccess" />
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="isSuccessModalOpen && uploadSuccessData"
        class="modal-overlay"
        @click.self="closeSuccessModal"
      >
        <div class="modal modal--success">
          <header class="modal__header">
            <div>
              <h2 class="modal__title">Проект загружен</h2>
              <p class="modal__subtitle">Ссылка готова к использованию</p>
            </div>
            <button
              type="button"
              class="modal__close"
              aria-label="Закрыть"
              @click="closeSuccessModal"
            >
              ✕
            </button>
          </header>
          <div class="modal__body success-modal">
            <AppAlert
              type="success"
              :message="`Проект «${uploadSuccessData.name}» загружен успешно.`"
            />
            <p class="success-modal__link">
              Открыть можно по адресу
              <a
                :href="uploadSuccessData.publicUrl"
                class="success-modal__url"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ uploadSuccessData.publicUrl }}
              </a>
            </p>
            <div class="success-modal__actions">
              <button type="button" class="btn btn--primary" @click="handleOpenSuccessUrl">
                Открыть сайт
              </button>
              <button
                type="button"
                class="btn btn--ghost"
                @click="handleCopyUrl(uploadSuccessData.publicUrl)"
              >
                Скопировать ссылку
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <div v-if="projectsStore.isLoading && projectsStore.projects.length === 0" class="table">
      <div class="table__header">
        <span>Название</span>
        <span>Размер</span>
        <span>Изменён</span>
        <span>Статус</span>
        <span>URL</span>
        <span>Действия</span>
      </div>
      <div v-for="i in 3" :key="i" class="table__row table__row--skeleton">
        <span><AppSkeleton width="60%" height="1rem" /></span>
        <span><AppSkeleton width="50%" height="1rem" /></span>
        <span><AppSkeleton width="40%" height="1rem" /></span>
        <span><AppSkeleton width="60%" height="1.5rem" /></span>
        <span><AppSkeleton width="80%" height="1rem" /></span>
        <span><AppSkeleton width="70%" height="1rem" /></span>
      </div>
    </div>

    <div v-else-if="projectsStore.projects.length > 0" class="table">
      <div class="table__header">
        <span>Название</span>
        <span>Размер</span>
        <span>Изменён</span>
        <span>Статус</span>
        <span>URL</span>
        <span>Действия</span>
      </div>
      <div
        v-for="project in projectsStore.projects"
        :key="project.id"
        class="table__row"
        :class="{ 'table__row--loading': projectsStore.isLoading }"
      >
        <span>{{ project.name }}</span>
        <span>{{ projectsStore.formatFileSize(project.size) }}</span>
        <span>{{ projectsStore.formatDate(project.updatedAt) }}</span>
        <span :class="['status', getStatusClass(project.status)]">
          {{ getStatusLabel(project.status) }}
        </span>
        <span class="mono url-cell">
          <span v-if="project.publicUrl" class="url-wrapper">
            <button
              type="button"
              class="url-button"
              :aria-describedby="`url-popover-${project.id}`"
              @click="handleCopyUrl(project.publicUrl)"
            >
              {{ project.publicUrl }}
            </button>
            <span
              :id="`url-popover-${project.id}`"
              class="url-popover"
              role="tooltip"
            >
              {{ project.publicUrl }}
            </span>
          </span>
          <span v-else class="url-placeholder">—</span>
        </span>
        <span class="actions">
          <button
            type="button"
            class="action-button action-button--icon"
            :disabled="projectsStore.isLoading"
            :data-label="'Открыть'"
            :aria-label="'Открыть'"
            @click="handleOpenProject(project.id)"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </button>
          <button
            v-if="project.status === 'ready'"
            type="button"
            class="action-button action-button--icon"
            :disabled="projectsStore.isLoading"
            :data-label="project.isPublic ? 'Скрыть' : 'Опубликовать'"
            :aria-label="project.isPublic ? 'Скрыть' : 'Опубликовать'"
            @click="handleTogglePublic(project)"
          >
            <svg
              v-if="project.isPublic"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
              />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
            <svg
              v-else
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <button
            type="button"
            class="action-button action-button--icon action-button--danger"
            :disabled="projectsStore.isLoading"
            :data-label="'Удалить'"
            :aria-label="'Удалить'"
            @click="handleDelete(project)"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path
                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              />
            </svg>
          </button>
        </span>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>Нет добавленных проектов</p>
    </div>
  </section>
</template>

<style scoped>
.dashboard header p {
  color: var(--text-secondary);
}

.dashboard__actions {
  margin: 2rem 0 0.5rem;
  display: flex;
  justify-content: flex-end;
}

.dashboard__add-button {
  min-width: 200px;
}

.table {
  margin-top: 1.5rem;
  border: 1px solid var(--border-strong);
  border-radius: 1rem;
  overflow: hidden;
}

.table__header,
.table__row {
  display: grid;
  grid-template-columns: 1fr 115px 115px 100px 1fr 140px;
  gap: 1rem;
  align-items: center;
  padding: 0.85rem 1rem;
}

.table__header {
  background: var(--surface-muted);
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.table__row:nth-child(even) {
  background: color-mix(in srgb, var(--surface-muted) 45%, transparent);
}

.table__row--loading {
  opacity: 0.6;
  pointer-events: none;
}

.table__row--skeleton {
  padding: 1rem;
}

.status {
  border-radius: 999px;
  padding: 0.2rem 0.8rem;
  font-size: 0.85rem;
  text-align: center;
}

.status--success {
  color: #035043;
  background: #c5f5e7;
}

.status--draft {
  color: #613b00;
  background: #ffe9c2;
}

.status--processing {
  color: #1e40af;
  background: #dbeafe;
}

.actions {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  font-size: 0.9rem;
}

.action-button {
  border: none;
  background: none;
  color: var(--accent-primary);
  cursor: pointer;
  padding: 0;
  font-size: inherit;
  transition: opacity 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.action-button:hover:not(:disabled) {
  opacity: 0.8;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button--danger {
  color: #ef4444;
}

.action-button svg {
  pointer-events: none;
}

.action-button--icon {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent-primary) 12%, transparent);
  padding: 0;
  transition:
    transform 0.15s ease,
    opacity 0.2s ease,
    background 0.2s ease;
}

.action-button--icon:disabled {
  opacity: 0.45;
}

.action-button--icon:not(:disabled):hover {
  transform: translateY(-1px);
  background: color-mix(in srgb, var(--accent-primary) 20%, transparent);
}

.action-button--icon::after {
  content: attr(data-label);
  position: absolute;
  bottom: calc(100% + 0.4rem);
  left: 50%;
  transform: translate(-50%, 4px);
  background: var(--surface-card);
  color: var(--text-primary);
  padding: 0.2rem 0.55rem;
  border-radius: 0.4rem;
  box-shadow: 0 4px 12px rgb(15 23 42 / 0.18);
  white-space: nowrap;
  font-size: 0.8rem;
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
  z-index: 2;
}

.action-button--icon::before {
  content: '';
  position: absolute;
  bottom: calc(100% - 2px);
  left: 50%;
  transform: translate(-50%, 4px) scale(0.75);
  border-width: 5px;
  border-style: solid;
  border-color: var(--surface-card) transparent transparent transparent;
  opacity: 0;
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
  z-index: 2;
}

.action-button--icon:hover::after,
.action-button--icon:focus-visible::after {
  opacity: 1;
  transform: translate(-50%, 0);
}

.action-button--icon:hover::before,
.action-button--icon:focus-visible::before {
  opacity: 1;
  transform: translate(-50%, 0) scale(1);
}

.action-button--danger.action-button--icon {
  background: color-mix(in srgb, #ef4444 15%, transparent);
}

.action-button--danger.action-button--icon:not(:disabled):hover {
  background: color-mix(in srgb, #ef4444 25%, transparent);
}

.url-cell {
  display: flex;
  align-items: center;
  min-width: 0;
}

.url-wrapper {
  position: relative;
  width: 100%;
  max-width: 100%;
  display: inline-block;
  overflow: visible;
}

.url-button {
  border: none;
  background: none;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
  padding: 0;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  transition: opacity 0.2s;
  width: 100%;
  display: block;
  position: relative;
}

.url-button:hover {
  opacity: 0.7;
  text-decoration: underline;
}

.url-popover {
  position: absolute;
  bottom: calc(100% + 0.5rem);
  left: 50%;
  transform: translate(-50%, 6px);
  background: var(--surface-card);
  color: var(--text-primary);
  padding: 0.35rem 0.65rem;
  border-radius: 0.4rem;
  box-shadow: 0 10px 35px rgb(15 23 42 / 0.2);
  font-size: 0.85rem;
  line-height: 1.35;
  max-width: min(520px, 70vw);
  white-space: normal;
  word-break: break-all;
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
  z-index: 5;
}

.url-popover::before {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translate(-50%, -4px);
  border-width: 6px;
  border-style: solid;
  border-color: var(--surface-card) transparent transparent transparent;
}

.url-wrapper:hover .url-popover,
.url-wrapper:focus-within .url-popover {
  opacity: 1;
  transform: translate(-50%, 0);
}

.url-placeholder {
  color: var(--text-secondary);
}

.mono {
  font-family:
    'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
}

.empty-state {
  margin-top: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgb(15 23 42 / 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 1000;
}

.modal {
  width: min(640px, 100%);
  background: var(--surface-card);
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgb(15 23 42 / 0.35);
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  gap: 1rem;
}

.modal__title {
  margin: 0;
  font-size: 1.4rem;
}

.modal__subtitle {
  margin: 0.15rem 0 0;
  color: var(--text-secondary);
}

.modal__close {
  border: none;
  background: none;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.2s ease;
}

.modal__close:hover {
  color: var(--text-primary);
}

.modal__body {
  padding: 1.5rem;
  overflow-y: auto;
}

.success-modal {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.success-modal__link {
  margin: 0;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.success-modal__url {
  margin-left: 0.35rem;
  color: var(--accent-primary);
  text-decoration: underline;
  word-break: break-all;
}

.success-modal__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

@media (max-width: 640px) {
  .dashboard__add-button {
    width: 100%;
  }
}

@media (max-width: 960px) {
  .table__header,
  .table__row {
    grid-template-columns: repeat(2, 1fr);
  }

  .table__header span:nth-child(n + 3),
  .table__row span:nth-child(n + 3) {
    display: none;
  }

  .table__row {
    border-top: 1px solid var(--border-subtle);
  }
}
</style>
