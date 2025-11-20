<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import { registerSchema, type RegisterFormData } from '@/validation/auth'
import AppInput from '@/components/ui/AppInput.vue'
import AppPasswordInput from '@/components/ui/AppPasswordInput.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive<RegisterFormData>({
  email: '',
  password: '',
  passwordConfirm: '',
})

const errors = reactive<Partial<Record<keyof RegisterFormData, string>>>({})
const apiError = ref<string>('')
const isSubmitting = ref(false)

const validateField = useDebounceFn((field: keyof RegisterFormData) => {
  try {
    if (field === 'passwordConfirm') {
      registerSchema.parse(form)
    } else {
      registerSchema.pick({ [field]: true }).parse({ [field]: form[field] })
      if (field === 'password' && form.passwordConfirm) {
        registerSchema.parse(form)
      }
    }
    errors[field] = undefined
  } catch (err: any) {
    if (err.errors) {
      const fieldError = err.errors.find((e: any) => e.path[0] === field)
      if (fieldError) {
        errors[field] = fieldError.message
      }
    }
  }
}, 300)

const handleBlur = (field: keyof RegisterFormData) => {
  validateField(field)
}

const handleInput = (field: keyof RegisterFormData) => {
  if (errors[field]) {
    validateField(field)
  }
  if (apiError.value) {
    apiError.value = ''
  }
}

const onSubmit = async () => {
  apiError.value = ''
  Object.keys(errors).forEach((key) => {
    errors[key as keyof RegisterFormData] = undefined
  })

  try {
    registerSchema.parse(form)
  } catch (err: any) {
    if (err.errors) {
      err.errors.forEach((error: any) => {
        const field = error.path[0] as keyof RegisterFormData
        errors[field] = error.message
      })
    }
    return
  }

  isSubmitting.value = true
  try {
    await authStore.register(form)
    const redirect = router.currentRoute.value.query.redirect as string | undefined
    router.push(redirect || '/dashboard')
  } catch (err: any) {
    apiError.value = err.response?.data?.message || err.message || 'Ошибка регистрации'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="register-form" @submit.prevent="onSubmit">
    <AppAlert v-if="apiError" type="error" :message="apiError" />

    <AppInput
      v-model="form.email"
      type="email"
      label="Email"
      placeholder="you@company.com"
      :error="errors.email"
      required
      @blur="handleBlur('email')"
      @input="handleInput('email')"
    />

    <AppPasswordInput
      v-model="form.password"
      label="Пароль"
      :error="errors.password"
      :show-strength-indicator="true"
      required
      @blur="handleBlur('password')"
      @input="handleInput('password')"
    />

    <AppPasswordInput
      v-model="form.passwordConfirm"
      label="Подтвердите пароль"
      :error="errors.passwordConfirm"
      required
      @blur="handleBlur('passwordConfirm')"
      @input="handleInput('passwordConfirm')"
    />

    <button class="btn btn--primary" type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? 'Регистрация...' : 'Создать аккаунт' }}
    </button>
  </form>
</template>

<style scoped>
.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}
</style>

