<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import { loginSchema, type LoginFormData } from '@/validation/auth'
import AppInput from '@/components/ui/AppInput.vue'
import AppPasswordInput from '@/components/ui/AppPasswordInput.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive<LoginFormData>({
  email: '',
  password: '',
})

const errors = reactive<Partial<Record<keyof LoginFormData, string>>>({})
const apiError = ref<string>('')
const isSubmitting = ref(false)

const validateField = useDebounceFn((field: keyof LoginFormData) => {
  try {
    loginSchema.pick({ [field]: true }).parse({ [field]: form[field] })
    errors[field] = undefined
  } catch (err: any) {
    if (err.errors?.[0]) {
      errors[field] = err.errors[0].message
    }
  }
}, 300)

const handleBlur = (field: keyof LoginFormData) => {
  validateField(field)
}

const handleInput = (field: keyof LoginFormData) => {
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
    errors[key as keyof LoginFormData] = undefined
  })

  try {
    loginSchema.parse(form)
  } catch (err: any) {
    if (err.errors) {
      err.errors.forEach((error: any) => {
        const field = error.path[0] as keyof LoginFormData
        errors[field] = error.message
      })
    }
    return
  }

  isSubmitting.value = true
  try {
    await authStore.login(form)
    const redirect = router.currentRoute.value.query.redirect as string | undefined
    router.push(redirect || '/dashboard')
  } catch (err: any) {
    apiError.value = err.response?.data?.message || err.message || 'Ошибка входа'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="login-form" @submit.prevent="onSubmit">
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
      required
      @blur="handleBlur('password')"
      @input="handleInput('password')"
    />

    <button class="btn btn--primary" type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? 'Вход...' : 'Войти' }}
    </button>
  </form>
</template>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}
</style>

