import { ref } from 'vue'

export interface Toast {
  id: string
  message: string
  type: 'error' | 'warning' | 'info' | 'success'
  duration?: number
}

const toasts = ref<Toast[]>([])

export function useToast() {
  const showToast = (message: string, type: Toast['type'] = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: Toast = { id, message, type, duration }
    toasts.value.push(toast)

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  return {
    toasts,
    showToast,
    removeToast,
  }
}

