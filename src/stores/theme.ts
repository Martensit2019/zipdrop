import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export type Theme = 'dark' | 'light'

const THEME_STORAGE_KEY = 'zipdrop-theme'

const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
  return stored === 'light' || stored === 'dark' ? stored : 'dark'
}

const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
}

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<Theme>(getStoredTheme())

  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    applyTheme(theme)
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    }
  }

  const toggleTheme = () => {
    setTheme(currentTheme.value === 'dark' ? 'light' : 'dark')
  }

  // Инициализация при создании стора
  applyTheme(currentTheme.value)

  // Следим за изменениями темы
  watch(currentTheme, (newTheme) => {
    applyTheme(newTheme)
  })

  return {
    currentTheme,
    setTheme,
    toggleTheme,
  }
})

