<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProjectsStore, type Project } from '@/stores/projects'
import { useToast } from '@/composables/useToast'
import AppAlert from '@/components/ui/AppAlert.vue'
import AppInput from '@/components/ui/AppInput.vue'
import { slugify } from '@/utils/slugify'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB в байтах
const ACCEPTED_TYPES = ['application/zip', 'application/x-zip-compressed', 'application/x-zip']

const projectsStore = useProjectsStore()
const { showToast } = useToast()

const projectName = ref('')
const selectedFile = ref<File | null>(null)
const isDragging = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const error = ref<string>('')
const nameError = ref<string>('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const lastGeneratedSlug = ref('')
const emit = defineEmits<{
  (e: 'upload-success', payload: { name: string; publicUrl: string }): void
}>()

const hasFile = computed(() => Boolean(selectedFile.value))
const fileSize = computed(() => {
  if (!selectedFile.value) return '0 B'
  return projectsStore.formatFileSize(selectedFile.value.size)
})

const isFileValid = computed(() => {
  if (!selectedFile.value) return false
  const file = selectedFile.value

  // Проверка типа файла
  const isValidType =
    ACCEPTED_TYPES.includes(file.type) ||
    file.name.toLowerCase().endsWith('.zip') ||
    file.name.toLowerCase().endsWith('.zipx')

  // Проверка размера
  const isValidSize = file.size <= MAX_FILE_SIZE

  return isValidType && isValidSize
})

const isNameValid = computed(() => {
  const trimmed = projectName.value.trim()
  return trimmed.length >= 1 && trimmed.length <= 100
})

const isFormValid = computed(() => {
  return isFileValid.value && isNameValid.value
})

const validateFile = (file: File): string | null => {
  // Проверка типа
  const isValidType =
    ACCEPTED_TYPES.includes(file.type) ||
    file.name.toLowerCase().endsWith('.zip') ||
    file.name.toLowerCase().endsWith('.zipx')

  if (!isValidType) {
    return 'Поддерживаются только ZIP-файлы'
  }

  // Проверка размера
  if (file.size > MAX_FILE_SIZE) {
    return `Размер файла не должен превышать ${projectsStore.formatFileSize(MAX_FILE_SIZE)}`
  }

  if (file.size === 0) {
    return 'Файл пустой'
  }

  return null
}

const handleFileSelect = (file: File) => {
  error.value = ''
  const validationError = validateFile(file)
  if (validationError) {
    error.value = validationError
    selectedFile.value = null
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
    return
  }
  selectedFile.value = file
}

const handleFileInputChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    handleFileSelect(file)
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  isDragging.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  isDragging.value = false
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  isDragging.value = false

  const file = event.dataTransfer?.files[0]
  if (file) {
    handleFileSelect(file)
  }
}

const handleRemoveFile = () => {
  selectedFile.value = null
  error.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const validateName = (): boolean => {
  const trimmed = projectName.value.trim()
  if (trimmed.length === 0) {
    nameError.value = 'Название проекта обязательно'
    return false
  }
  if (trimmed.length > 100) {
    nameError.value = 'Название не должно превышать 100 символов'
    return false
  }
  nameError.value = ''
  return true
}

const getProjectPublicUrl = (project: Project): string | null => {
  if (project.publicUrl?.trim()) {
    return project.publicUrl.trim()
  }

  const fallbackSlug = project.slug?.trim() || project.id?.trim()
  if (!fallbackSlug) {
    return null
  }
  return `https://${fallbackSlug}.zipdrop.ru`
}

const handleUpload = async () => {
  if (!selectedFile.value || !isFileValid.value) {
    error.value = 'Пожалуйста, выберите валидный ZIP-файл'
    return
  }

  if (!validateName()) {
    return
  }

  const trimmedName = projectName.value.trim()
  isUploading.value = true
  uploadProgress.value = 0
  error.value = ''
  nameError.value = ''
  lastGeneratedSlug.value = slugify(trimmedName)

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('name', trimmedName)

    // Симуляция прогресса для UX (реальный прогресс будет через axios interceptor или xhr)
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 200)

    const project = await projectsStore.createProject(formData)

    clearInterval(progressInterval)
    uploadProgress.value = 100

    // Обновляем список проектов для получения актуального статуса распаковки
    try {
      await projectsStore.fetchProjects()
    } catch (err) {
      // Игнорируем ошибку обновления, проект уже добавлен
    } finally {
      projectsStore.ensureProjectListed(project)
    }

    // Очистка формы после успешной загрузки
    setTimeout(() => {
      selectedFile.value = null
      projectName.value = ''
      uploadProgress.value = 0
      nameError.value = ''
      lastGeneratedSlug.value = ''
      if (fileInputRef.value) {
        fileInputRef.value.value = ''
      }
    }, 500)

    // Показываем публичный URL, если он есть
    const freshProject = projectsStore.projects.find((p) => p.id === project.id) ?? project
    const publicUrl = getProjectPublicUrl(freshProject)

    const inputBasedUrl = lastGeneratedSlug.value
      ? `https://${lastGeneratedSlug.value}.zipdrop.ru`
      : null
    const finalUrl = inputBasedUrl || publicUrl

    const displayName = trimmedName || freshProject.name

    if (finalUrl) {
      emit('upload-success', { name: displayName, publicUrl: finalUrl })
      showToast(`Проект загружен! Публичный URL: ${finalUrl}`, 'success', 6000)
    } else if (freshProject.status === 'processing') {
      showToast('Проект загружен. Идёт обработка...', 'info', 4000)
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Не удалось загрузить файл'
    uploadProgress.value = 0
  } finally {
    isUploading.value = false
  }
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}
</script>

<template>
  <div class="upload-form">
    <AppInput
      v-model="projectName"
      label="Название проекта"
      placeholder="Введите название проекта"
      :error="nameError"
      required
      @blur="validateName"
    />

    <div
      class="upload-form__dropzone"
      :class="{
        'upload-form__dropzone--dragging': isDragging,
        'upload-form__dropzone--has-file': hasFile,
        'upload-form__dropzone--error': error && !isDragging,
      }"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept=".zip,.zipx,application/zip,application/x-zip-compressed,application/x-zip"
        class="upload-form__input"
        @change="handleFileInputChange"
      />

      <div v-if="!hasFile" class="upload-form__empty">
        <svg
          class="upload-form__icon"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p class="upload-form__text">
          Перетащите ZIP-файл сюда или
          <button type="button" class="upload-form__link" @click="triggerFileInput">
            выберите файл
          </button>
        </p>
        <p class="upload-form__hint">
          Максимальный размер: {{ projectsStore.formatFileSize(MAX_FILE_SIZE) }}
        </p>
      </div>

      <div v-else class="upload-form__file-info">
        <div class="upload-form__file-details">
          <svg
            class="upload-form__file-icon"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <div class="upload-form__file-meta">
            <p class="upload-form__file-name">{{ selectedFile?.name }}</p>
            <p class="upload-form__file-size">{{ fileSize }}</p>
          </div>
        </div>
        <button
          v-if="!isUploading"
          type="button"
          class="upload-form__remove"
          @click="handleRemoveFile"
          title="Удалить файл"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>

    <AppAlert v-if="error" type="error" :message="error" />

    <div v-if="isUploading" class="upload-form__progress">
      <div class="upload-form__progress-bar">
        <div class="upload-form__progress-fill" :style="{ width: `${uploadProgress}%` }"></div>
      </div>
      <p class="upload-form__progress-text">
        {{ uploadProgress < 100 ? 'Загрузка...' : 'Обработка...' }}
      </p>
    </div>

    <button
      class="btn btn--primary upload-form__submit"
      type="button"
      :disabled="!isFormValid || isUploading"
      @click="handleUpload"
    >
      {{ isUploading ? 'Загрузка...' : 'Загрузить проект' }}
    </button>
  </div>
</template>

<style scoped>
.upload-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upload-form__dropzone {
  position: relative;
  border: 2px dashed var(--border-strong);
  border-radius: 1rem;
  padding: 3rem 2rem;
  background: var(--surface-card);
  transition: all 0.2s ease;
  cursor: pointer;
}

.upload-form__dropzone:hover {
  border-color: var(--accent-primary);
  background: color-mix(in srgb, var(--surface-card) 95%, var(--accent-primary));
}

.upload-form__dropzone--dragging {
  border-color: var(--accent-primary);
  background: color-mix(in srgb, var(--surface-card) 90%, var(--accent-primary));
  transform: scale(1.01);
}

.upload-form__dropzone--has-file {
  border-color: var(--accent-primary);
  background: var(--surface-card);
  padding: 1.5rem;
}

.upload-form__dropzone--error {
  border-color: #ef4444;
}

.upload-form__input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.upload-form__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.upload-form__icon {
  color: var(--accent-primary);
  opacity: 0.7;
}

.upload-form__text {
  margin: 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.upload-form__link {
  background: none;
  border: none;
  color: var(--accent-primary);
  cursor: pointer;
  text-decoration: underline;
  font: inherit;
  padding: 0;
  transition: opacity 0.2s;
}

.upload-form__link:hover {
  opacity: 0.8;
}

.upload-form__hint {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.upload-form__file-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  position: relative;
}

.upload-form__file-details {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  margin-right: 2.5rem;
}

.upload-form__file-icon {
  color: var(--accent-primary);
  flex-shrink: 0;
}

.upload-form__file-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.upload-form__file-name {
  margin: 0;
  color: var(--text-primary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-form__file-size {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.upload-form__remove {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  transition: all 0.2s;
  flex-shrink: 0;
  position: absolute;
  right: 0;
}

.upload-form__remove:hover {
  background: color-mix(in srgb, var(--surface-muted) 50%, transparent);
  color: #ef4444;
}

.upload-form__progress {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upload-form__progress-bar {
  width: 100%;
  height: 8px;
  background: var(--surface-muted);
  border-radius: 999px;
  overflow: hidden;
}

.upload-form__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-primary-strong));
  border-radius: 999px;
  transition: width 0.3s ease;
}

.upload-form__progress-text {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.85rem;
  text-align: center;
}

.upload-form__submit {
  width: 100%;
  margin-top: 0.5rem;
}

.upload-form__submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
</style>
