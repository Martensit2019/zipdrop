import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import apiClient, { getSessionToken, setSessionToken } from '@/api/client'

interface AuthCredentials {
  email: string
  password: string
}

interface RegisterCredentials {
  email: string
  password: string
}

interface AuthUser {
  id: string
  email: string
}

interface AuthResponse {
  token: string
  user: AuthUser
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getSessionToken())
  const currentUser = ref<AuthUser | null>(null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => Boolean(token.value))

  const setToken = (value: string | null) => {
    token.value = value
    setSessionToken(value)
  }

  const login = async (credentials: AuthCredentials): Promise<AuthResponse> => {
    isLoading.value = true
    try {
      // Временный мок для разработки (пока бэкенд не готов)
      const MOCK_MODE = import.meta.env.VITE_MOCK_AUTH === 'true'
      
      if (MOCK_MODE) {
        // Симулируем задержку сети
        await new Promise((resolve) => setTimeout(resolve, 500))
        const mockResponse: AuthResponse = {
          token: `mock-token-${Date.now()}`,
          user: { id: '1', email: credentials.email },
        }
        setToken(mockResponse.token)
        currentUser.value = mockResponse.user
        return mockResponse
      }

      const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
      setToken(response.data.token)
      currentUser.value = response.data.user
      return response.data
    } finally {
      isLoading.value = false
    }
  }

  const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    isLoading.value = true
    try {
      // Временный мок для разработки (пока бэкенд не готов)
      const MOCK_MODE = import.meta.env.VITE_MOCK_AUTH === 'true'
      
      if (MOCK_MODE) {
        // Симулируем задержку сети
        await new Promise((resolve) => setTimeout(resolve, 500))
        const mockResponse: AuthResponse = {
          token: `mock-token-${Date.now()}`,
          user: { id: '2', email: credentials.email },
        }
        setToken(mockResponse.token)
        currentUser.value = mockResponse.user
        return mockResponse
      }

      const response = await apiClient.post<AuthResponse>('/auth/register', credentials)
      setToken(response.data.token)
      currentUser.value = response.data.user
      return response.data
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.error('logout error', error)
    } finally {
      setToken(null)
      currentUser.value = null
    }
  }

  const refreshSession = async () => {
    if (!token.value) return
    try {
      const response = await apiClient.post<{ token: string }>('/auth/refresh')
      setToken(response.data.token)
    } catch (error) {
      console.error('refresh failed', error)
      logout()
    }
  }

  return {
    token,
    currentUser,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshSession,
  }
})
