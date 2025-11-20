<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  label?: string
  error?: string
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)

const hasError = computed(() => Boolean(props.error))
</script>

<template>
  <div class="app-input">
    <label v-if="label" :for="inputId" class="app-input__label">
      {{ label }}
      <span v-if="required" class="app-input__required">*</span>
    </label>
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :class="{ 'app-input__field--error': hasError }"
      class="app-input__field"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" class="app-input__error">{{ error }}</span>
  </div>
</template>

<style scoped>
.app-input {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.app-input__label {
  display: block;
  margin-bottom: 0.35rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}

.app-input__required {
  color: var(--accent-primary);
  margin-left: 0.25rem;
}

.app-input__field {
  width: 100%;
  border-radius: 0.85rem;
  border: 1px solid var(--border-subtle);
  padding: 0.85rem 1rem;
  background: var(--surface-muted);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

:global([data-theme='dark']) .app-input__field {
  background: var(--surface-card);
}

.app-input__field:focus {
  border-color: var(--accent-primary);
  outline: none;
  background: var(--surface-muted);
}

:global([data-theme='dark']) .app-input__field:focus {
  background: var(--surface-card);
}

.app-input__field--error {
  border-color: #ef4444;
}

.app-input__field--error:focus {
  border-color: #ef4444;
}

.app-input__error {
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: -0.25rem;
}
</style>

