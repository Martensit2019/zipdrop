import axios, { AxiosHeaders } from 'axios'

const AUTH_TOKEN_KEY = 'zipdrop_jwt'
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? '/api'

const hasWindow = typeof window !== 'undefined'

const getStorage = () => {
  if (!hasWindow) return null
  return window.localStorage
}

let isRefreshing = false
/** @type {Array<{resolve: (value?: any) => void, reject: (reason?: any) => void}>} */
let failedQueue = []

/**
 * @param {any} error
 * @param {string | null} token
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

/**
 * @type {import('axios').AxiosInstance}
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const headers = AxiosHeaders.from(config.headers)
  const token = getSessionToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  headers.set('X-Client', 'zipdrop')
  headers.set('X-Requested-With', 'XMLHttpRequest')
  config.headers = headers
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status

    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const token = getSessionToken()
        if (token) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          const newToken = response.data.token
          setSessionToken(newToken)
          processQueue(null, newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return apiClient(originalRequest)
        } else {
          throw new Error('No token to refresh')
        }
      } catch (refreshError) {
        processQueue(refreshError, null)
        setSessionToken(null)
        if (hasWindow) {
          const { useToast } = await import('@/composables/useToast')
          const { showToast } = useToast()
          showToast('Сессия истекла. Пожалуйста, войдите снова', 'error')
          if (window.location.pathname !== '/auth') {
            window.location.href = '/auth'
          }
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    if (status >= 500) {
      console.error('API error', error)
    }

    return Promise.reject(error)
  },
)

/**
 * @param {string | null} token
 */
export const setSessionToken = (token) => {
  const storage = getStorage()
  if (!storage) return
  if (token) {
    storage.setItem(AUTH_TOKEN_KEY, token)
  } else {
    storage.removeItem(AUTH_TOKEN_KEY)
  }
}

export const getSessionToken = () => getStorage()?.getItem(AUTH_TOKEN_KEY) ?? null

export { AUTH_TOKEN_KEY }
export default apiClient
