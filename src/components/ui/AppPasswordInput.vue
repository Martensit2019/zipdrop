<script setup lang="ts">
import { ref, computed } from 'vue'
import AppInput from './AppInput.vue'
import Icon from './Icon.vue'
import { calculatePasswordStrength } from '@/validation/auth'

interface Props {
  modelValue: string
  placeholder?: string
  label?: string
  error?: string
  required?: boolean
  showStrengthIndicator?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showStrengthIndicator: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isPasswordVisible = ref(false)
const passwordStrength = computed(() => {
  if (!props.showStrengthIndicator || !props.modelValue) return null
  return calculatePasswordStrength(props.modelValue)
})

const toggleVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value
}
</script>

<template>
  <div class="app-password-input">
    <div class="app-password-input__wrapper">
      <AppInput
        :model-value="modelValue"
        :type="isPasswordVisible ? 'text' : 'password'"
        :placeholder="placeholder"
        :label="label"
        :error="error"
        :required="required"
        @update:model-value="emit('update:modelValue', $event)"
      />
      <button
        type="button"
        class="app-password-input__toggle"
        @click="toggleVisibility"
        :aria-label="isPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'"
      >
        <Icon :name="isPasswordVisible ? 'eye-off' : 'eye'" :size="20" />
      </button>
    </div>
    <div v-if="showStrengthIndicator && passwordStrength" class="app-password-input__strength">
      <div class="app-password-input__strength-bar">
        <div
          class="app-password-input__strength-fill"
          :style="{
            width: `${(passwordStrength.score / 6) * 100}%`,
            backgroundColor: passwordStrength.color,
          }"
        ></div>
      </div>
      <span class="app-password-input__strength-label" :style="{ color: passwordStrength.color }">
        {{ passwordStrength.label }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.app-password-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.app-password-input__wrapper {
  position: relative;
}

.app-password-input__wrapper :deep(.app-input__field) {
  padding-right: 3rem;
}

.app-password-input__wrapper :deep(.app-input) {
  margin-bottom: 0;
}

.app-password-input__wrapper :deep(.app-input__field) {
  position: relative;
}

.app-password-input__toggle {
  position: absolute;
  right: 0.75rem;
  top: 60px;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: var(--text-secondary);
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.app-password-input__toggle:hover {
  color: var(--text-primary);
}

.app-password-input__strength {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.app-password-input__strength-bar {
  flex: 1;
  height: 4px;
  background: var(--border-subtle);
  border-radius: 2px;
  overflow: hidden;
}

.app-password-input__strength-fill {
  height: 100%;
  transition:
    width 0.3s ease,
    background-color 0.3s ease;
}

.app-password-input__strength-label {
  font-size: 0.85rem;
  font-weight: 500;
  min-width: 60px;
}
</style>
