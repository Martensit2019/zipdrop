import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import apiClient from '@/api/client'
import { useToast } from '@/composables/useToast'
import { slugify } from '@/utils/slugify'

export interface Project {
  id: string
  name: string
  slug: string
  size: number // в байтах
  updatedAt: string
  createdAt: string
  isPublic: boolean
  publicUrl: string | null
  status: 'ready' | 'processing' | 'draft'
  fileCount?: number
  viewCount?: number
}

interface CreateProjectResponse {
  project: Project
}

interface ProjectsResponse {
  projects: Project[]
}

interface ProjectResponse {
  project: Project
}

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const customNames = ref<Record<string, string>>({})
  const customSlugs = ref<Record<string, string>>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const { showToast } = useToast()

  interface ApiErrorResponse {
    response?: {
      data?: {
        message?: string
      }
    }
  }

  const isApiErrorResponse = (err: unknown): err is ApiErrorResponse => {
    return typeof err === 'object' && err !== null && 'response' in err
  }

  const extractErrorMessage = (err: unknown, fallback: string): string => {
    if (isApiErrorResponse(err)) {
      const message = err.response?.data?.message
      if (typeof message === 'string' && message.trim().length > 0) {
        return message
      }
    }
    return fallback
  }

  const getRandomId = (): string => {
    const cryptoObj = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined
    if (cryptoObj?.randomUUID) {
      return cryptoObj.randomUUID()
    }
    return `proj-${Math.random().toString(36).slice(2, 10)}`
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const buildPublicUrl = (slug: string, fallback?: string): string => {
    const normalizedSlug = slug?.trim() || fallback?.trim() || ''
    if (!normalizedSlug) {
      return 'http://zipdrop.ru'
    }
    return `http://${normalizedSlug}.zipdrop.ru`
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'только что'
    if (diffMins < 60)
      return `${diffMins} ${pluralize(diffMins, 'минуту', 'минуты', 'минут')} назад`
    if (diffHours < 24) return `${diffHours} ${pluralize(diffHours, 'час', 'часа', 'часов')} назад`
    if (diffDays === 1) return 'вчера'
    if (diffDays < 7) return `${diffDays} ${pluralize(diffDays, 'день', 'дня', 'дней')} назад`
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }

  const pluralize = (count: number, one: string, few: string, many: string): string => {
    const mod10 = count % 10
    const mod100 = count % 100
    if (mod10 === 1 && mod100 !== 11) return one
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
    return many
  }

  const applyCustomName = (project: Project) => {
    const customName = customNames.value[project.id]
    if (typeof customName === 'string' && customName.trim().length > 0) {
      project.name = customName.trim()
    }
  }

  const applyCustomSlug = (project: Project) => {
    const customSlug = customSlugs.value[project.id]
    if (typeof customSlug === 'string' && customSlug.trim().length > 0) {
      project.slug = customSlug.trim()
    }
  }

  const applyCustomNames = () => {
    projects.value.forEach(project => {
      applyCustomName(project)
      applyCustomSlug(project)
    })
  }

  const setCustomName = (projectId: string, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    customNames.value = {
      ...customNames.value,
      [projectId]: trimmed,
    }
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      project.name = trimmed
    }
  }

  const setCustomSlug = (projectId: string, slug: string) => {
    const trimmed = slug.trim()
    if (!trimmed) return
    customSlugs.value = {
      ...customSlugs.value,
      [projectId]: trimmed,
    }
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      project.slug = trimmed
    }
  }

  const ensureProjectListed = (project: Project) => {
    const index = projects.value.findIndex((p) => p.id === project.id)
    if (index === -1) {
      const enrichedProject = { ...project }
      applyCustomName(enrichedProject)
      applyCustomSlug(enrichedProject)
      projects.value = [enrichedProject, ...projects.value]
      return
    }
    const updatedProject = { ...projects.value[index], ...project }
    applyCustomName(updatedProject)
    applyCustomSlug(updatedProject)
    projects.value[index] = updatedProject
  }

  const fetchProjects = async () => {
    isLoading.value = true
    error.value = null
    try {
      const MOCK_MODE = import.meta.env.VITE_MOCK_AUTH === 'true'

      if (MOCK_MODE) {
        // Мок для разработки
        await new Promise((resolve) => setTimeout(resolve, 800))
        projects.value = [
          {
            id: '9aa1a68b-3e75-4a71-b3ca-8c77b94d2bbd',
            name: 'Маркетинговый сайт',
            slug: 'marketingovyi-sait',
            size: 4404019, // 4.2 MB
            updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
            createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
            isPublic: true,
            publicUrl: 'https://marketingovyi-sait.zipdrop.ru',
            status: 'ready',
            fileCount: 12,
            viewCount: 45,
          },
          {
            id: 'ff9cd8ce-42bf-4f9a-a3ec-5df76f886e9d',
            name: 'Портфолио',
            slug: 'portfolio',
            size: 8178892, // 7.8 MB
            updatedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
            createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
            isPublic: false,
            publicUrl: null,
            status: 'draft',
            fileCount: 8,
            viewCount: 0,
          },
        ]
        applyCustomNames()
        return
      }

      const response = await apiClient.get<ProjectsResponse>('/projects')
      projects.value = response.data.projects
      applyCustomNames()
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err, 'Не удалось загрузить проекты')
      error.value = errorMessage
      showToast(errorMessage, 'error')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchProjectById = async (
    id: string,
    options?: { force?: boolean },
  ): Promise<Project | null> => {
    if (!options?.force) {
      const cached = projects.value.find((p) => p.id === id)
      if (cached) return cached
    }

    isLoading.value = true
    error.value = null

    try {
      const MOCK_MODE = import.meta.env.VITE_MOCK_AUTH === 'true'

      if (MOCK_MODE) {
        await new Promise((resolve) => setTimeout(resolve, 400))
        const mockProjects: Project[] = [
          {
            id: '9aa1a68b-3e75-4a71-b3ca-8c77b94d2bbd',
            name: 'Маркетинговый сайт',
            slug: 'marketingovyi-sait',
            size: 4404019,
            updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
            createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
            isPublic: true,
            publicUrl: 'https://marketingovyi-sait.zipdrop.ru',
            status: 'ready',
            fileCount: 12,
            viewCount: 45,
          },
          {
            id: 'ff9cd8ce-42bf-4f9a-a3ec-5df76f886e9d',
            name: 'portfolio.zip',
            slug: 'portfolio-zip',
            size: 8178892,
            updatedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
            createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
            isPublic: false,
            publicUrl: null,
            status: 'draft',
            fileCount: 8,
            viewCount: 0,
          },
        ]

        const mockProject = mockProjects.find((p) => p.id === id)
        if (!mockProject) {
          throw new Error('Проект не найден')
        }

        const index = projects.value.findIndex((p) => p.id === id)
        if (index === -1) {
          projects.value.push(mockProject)
        } else {
          projects.value[index] = mockProject
        }
        return mockProject
      }

      const response = await apiClient.get<ProjectResponse>(`/projects/${id}`)
      const fetchedProject = response.data.project
      applyCustomName(fetchedProject)
      applyCustomSlug(fetchedProject)
      const index = projects.value.findIndex((p) => p.id === id)
      if (index === -1) {
        projects.value.push(fetchedProject)
      } else {
        projects.value[index] = fetchedProject
      }
      return fetchedProject
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err, 'Не удалось загрузить проект')
      error.value = errorMessage
      showToast(errorMessage, 'error')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createProject = async (formData: FormData): Promise<Project> => {
    isLoading.value = true
    error.value = null
    try {
      const MOCK_MODE = import.meta.env.VITE_MOCK_AUTH === 'true'

      if (MOCK_MODE) {
        // Мок для разработки
        await new Promise((resolve) => setTimeout(resolve, 1500))
        const fileEntry = formData.get('file')
        const fileName = fileEntry instanceof File ? fileEntry.name : 'project.zip'
        const providedName = (formData.get('name') as string)?.trim()
        const projectSlug = providedName
          ? slugify(providedName) || `project-${Date.now()}`
          : slugify(fileName.replace(/\.(zip|zipx)$/i, '')) || `project-${Date.now()}`
        const newProject: Project = {
          id: getRandomId(),
          name: providedName || fileName.replace(/\.(zip|zipx)$/i, ''),
          slug: projectSlug,
          size: fileEntry instanceof File ? fileEntry.size : 1024000,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          isPublic: false,
          publicUrl: null,
          status: 'processing',
          fileCount: 0,
          viewCount: 0,
        }
        ensureProjectListed(newProject)
        if (providedName) {
          setCustomName(newProject.id, providedName)
          setCustomSlug(newProject.id, projectSlug)
        }
        showToast('Проект загружен успешно', 'success')
        return newProject
      }

      const providedName = (formData.get('name') as string)?.trim()

      const response = await apiClient.post<CreateProjectResponse>('/projects', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      const project = response.data.project
      if (providedName) {
        project.name = providedName
        setCustomName(project.id, providedName)
        // Сохраняем slug из названия проекта, если он отличается от того, что вернул сервер
        const expectedSlug = slugify(providedName)
        if (expectedSlug && expectedSlug !== project.slug) {
          project.slug = expectedSlug
          setCustomSlug(project.id, expectedSlug)
        }
      }
      ensureProjectListed(project)
      showToast('Проект загружен успешно', 'success')
      return project
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err, 'Не удалось создать проект')
      error.value = errorMessage
      showToast(errorMessage, 'error')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteProject = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      const MOCK_MODE = import.meta.env.VITE_MOCK_AUTH === 'true'

      if (MOCK_MODE) {
        // Мок для разработки
        await new Promise((resolve) => setTimeout(resolve, 500))
        projects.value = projects.value.filter((p) => p.id !== id)
        showToast('Проект удалён', 'success')
        return
      }

      await apiClient.delete(`/projects/${id}`)
      projects.value = projects.value.filter((p) => p.id !== id)
      showToast('Проект удалён', 'success')
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err, 'Не удалось удалить проект')
      error.value = errorMessage
      showToast(errorMessage, 'error')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const togglePublic = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      const project = projects.value.find((p) => p.id === id)
      if (!project) throw new Error('Проект не найден')

      const MOCK_MODE = import.meta.env.VITE_MOCK_AUTH === 'true'

      if (MOCK_MODE) {
        // Мок для разработки
        await new Promise((resolve) => setTimeout(resolve, 500))
        project.isPublic = !project.isPublic
        if (project.isPublic) {
          project.publicUrl = buildPublicUrl(project.slug, project.id)
        } else {
          project.publicUrl = null
        }
        showToast(
          project.isPublic ? 'Проект опубликован' : 'Проект скрыт',
          project.isPublic ? 'success' : 'info',
        )
        return
      }

      const response = await apiClient.patch<{ project: Project }>(`/projects/${id}/toggle-public`)
      const updatedProject = response.data.project
      applyCustomName(updatedProject)
      applyCustomSlug(updatedProject)
      if (updatedProject.isPublic && !updatedProject.publicUrl) {
        updatedProject.publicUrl = buildPublicUrl(updatedProject.slug, updatedProject.id)
      }
      const index = projects.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }
      showToast(
        updatedProject.isPublic ? 'Проект опубликован' : 'Проект скрыт',
        updatedProject.isPublic ? 'success' : 'info',
      )
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err, 'Не удалось изменить статус проекта')
      error.value = errorMessage
      showToast(errorMessage, 'error')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const trackView = async (id: string) => {
    try {
      const MOCK_MODE = import.meta.env.VITE_MOCK_AUTH === 'true'

      if (MOCK_MODE) {
        // Мок для разработки - просто увеличиваем счётчик локально
        const project = projects.value.find((p) => p.id === id)
        if (project && project.viewCount !== undefined) {
          project.viewCount = (project.viewCount || 0) + 1
        }
        return
      }

      await apiClient.post(`/projects/${id}/view`)
      // Обновляем локальный счётчик после успешного запроса
      const project = projects.value.find((p) => p.id === id)
      if (project && project.viewCount !== undefined) {
        project.viewCount = (project.viewCount || 0) + 1
      }
    } catch (err: unknown) {
      // Тихая ошибка - не показываем toast для аналитики
      console.warn('Failed to track view:', err)
    }
  }

  const getProjectById = computed(() => {
    return (id: string) => projects.value.find((p) => p.id === id)
  })

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
    fetchProjectById,
    createProject,
    deleteProject,
    togglePublic,
    trackView,
    getProjectById,
    formatFileSize,
    formatDate,
    ensureProjectListed,
    setCustomName,
  }
})
