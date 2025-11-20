<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<template>
  <div class="toast-container">
    <TransitionGroup name="toast" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="`toast--${toast.type}`"
        @click="removeToast(toast.id)"
      >
        <span class="toast__message">{{ toast.message }}</span>
        <button class="toast__close" type="button" @click.stop="removeToast(toast.id)">
          ×
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 0.85rem;
  background: var(--surface-card);
  border: 1px solid var(--border-strong);
  color: var(--text-primary);
  min-width: 280px;
  max-width: 400px;
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.toast:hover {
  transform: translateX(-4px);
}

.toast--error {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.toast--warning {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.toast--info {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.toast--success {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.toast__message {
  flex: 1;
  font-size: 0.9rem;
}

.toast__close {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.toast__close:hover {
  color: var(--text-primary);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>

