import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'
import apiClient from '@/api/client'
import { setSessionToken, getSessionToken } from '@/api/client'

vi.mock('@/api/client', async () => {
  const actual = await vi.importActual('@/api/client')
  return {
    ...actual,
    default: {
      post: vi.fn(),
      get: vi.fn(),
    },
  }
})

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('должен успешно войти и сохранить токен', async () => {
      const store = useAuthStore()
      const mockResponse = {
        data: {
          token: 'test-token',
          user: { id: '1', email: 'test@example.com' },
        },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      await store.login({ email: 'test@example.com', password: 'password123' })

      expect(store.token).toBe('test-token')
      expect(store.currentUser).toEqual({ id: '1', email: 'test@example.com' })
      expect(store.isAuthenticated).toBe(true)
      expect(getSessionToken()).toBe('test-token')
    })

    it('должен обработать ошибку входа', async () => {
      const store = useAuthStore()
      const mockError = {
        response: { data: { message: 'Invalid credentials' } },
      }

      vi.mocked(apiClient.post).mockRejectedValue(mockError)

      await expect(
        store.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toEqual(mockError)
      expect(store.token).toBeNull()
      expect(store.currentUser).toBeNull()
    })
  })

  describe('register', () => {
    it('должен успешно зарегистрироваться и сохранить токен', async () => {
      const store = useAuthStore()
      const mockResponse = {
        data: {
          token: 'new-token',
          user: { id: '2', email: 'new@example.com' },
        },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      await store.register({ email: 'new@example.com', password: 'password123' })

      expect(store.token).toBe('new-token')
      expect(store.currentUser).toEqual({ id: '2', email: 'new@example.com' })
      expect(store.isAuthenticated).toBe(true)
    })
  })

  describe('logout', () => {
    it('должен выйти и очистить токен', async () => {
      const store = useAuthStore()
      setSessionToken('test-token')
      store.token = 'test-token'
      store.currentUser = { id: '1', email: 'test@example.com' }

      vi.mocked(apiClient.post).mockResolvedValue({ data: {} })

      await store.logout()

      expect(store.token).toBeNull()
      expect(store.currentUser).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(getSessionToken()).toBeNull()
    })
  })

  describe('refreshSession', () => {
    it('должен обновить токен при успешном refresh', async () => {
      const store = useAuthStore()
      setSessionToken('old-token')
      store.token = 'old-token'

      const mockResponse = {
        data: { token: 'new-refreshed-token' },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      await store.refreshSession()

      expect(store.token).toBe('new-refreshed-token')
      expect(getSessionToken()).toBe('new-refreshed-token')
    })

    it('должен выйти при ошибке refresh', async () => {
      const store = useAuthStore()
      setSessionToken('old-token')
      store.token = 'old-token'
      store.currentUser = { id: '1', email: 'test@example.com' }

      vi.mocked(apiClient.post).mockRejectedValue(new Error('Refresh failed'))

      await store.refreshSession()

      expect(store.token).toBeNull()
      expect(store.currentUser).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('должен возвращать false когда токена нет', () => {
      const store = useAuthStore()
      store.token = null
      expect(store.isAuthenticated).toBe(false)
    })

    it('должен возвращать true когда токен есть', () => {
      const store = useAuthStore()
      store.token = 'test-token'
      expect(store.isAuthenticated).toBe(true)
    })
  })
})

