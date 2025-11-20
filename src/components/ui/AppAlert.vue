<script setup lang="ts">
import { computed } from 'vue'
import Icon from './Icon.vue'

interface Props {
  type?: 'error' | 'warning' | 'info' | 'success'
  message: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'error',
})

const typeStyles = {
  error: { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', icon: 'warning' as const },
  warning: { bg: 'rgba(245, 158, 11, 0.1)', border: '#f59e0b', icon: 'warning' as const },
  info: { bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6', icon: 'info' as const },
  success: { bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981', icon: 'check' as const },
}

const style = computed(() => typeStyles[props.type])
</script>

<template>
  <div class="app-alert" :style="{ backgroundColor: style.bg, borderColor: style.border }">
    <span class="app-alert__icon">
      <Icon :name="style.icon" :size="20" />
    </span>
    <span class="app-alert__message">{{ message }}</span>
  </div>
</template>

<style scoped>
.app-alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 0.85rem;
  border: 1px solid;
  font-size: 0.9rem;
}

.app-alert__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  color: currentColor;
}

.app-alert__message {
  flex: 1;
  color: var(--text-primary);
}
</style>

