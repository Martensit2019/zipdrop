<script setup lang="ts">
import { ref } from 'vue'
import LoginForm from '@/components/auth/LoginForm.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'

const isLoginMode = ref(true)

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
}
</script>

<template>
  <section class="auth-card">
    <div class="auth-card__header">
      <h1>{{ isLoginMode ? 'Вход' : 'Регистрация' }}</h1>
      <p v-if="isLoginMode">Войдите в свой аккаунт для доступа к проектам</p>
      <p v-else>Создайте новый аккаунт для начала работы</p>
    </div>

    <LoginForm v-if="isLoginMode" />
    <RegisterForm v-else />

    <button class="btn btn--ghost auth-card__toggle" type="button" @click="toggleMode">
      <template v-if="isLoginMode">
        Нет аккаунта? <span class="auth-card__toggle-link">Зарегистрируйтесь</span>
      </template>
      <template v-else>
        Уже есть аккаунт? <span class="auth-card__toggle-link">Войти</span>
      </template>
    </button>
  </section>
</template>

<style scoped>
.auth-card {
  width: min(480px, 100%);
  margin: 0 auto;
  border: 1px solid var(--border-strong);
  border-radius: 1.5rem;
  padding: clamp(1.5rem, 4vw, 2.5rem);
  background: var(--surface-card);
}

.auth-card__header p {
  color: var(--text-secondary);
}

.auth-card__toggle {
  margin-top: 1.5rem;
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: fit-content;
  border: none;
}

.auth-card__toggle:hover {
  border: none;
}

.auth-card__toggle-link {
  color: var(--text-primary);
  transition: color 0.2s ease;
  margin-left: 0.5rem;
}

.auth-card__toggle:hover .auth-card__toggle-link {
  color: var(--accent-primary);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.field span {
  display: block;
  margin-bottom: 0.35rem;
  color: var(--text-secondary);
}

.field input {
  width: 100%;
  border-radius: 0.85rem;
  border: 1px solid var(--border-subtle);
  padding: 0.85rem 1rem;
  background: var(--surface-muted);
}

.field input:focus {
  border-color: var(--accent-primary);
  outline: none;
  background: #fff;
}

.btn + .btn {
  margin-top: 0.75rem;
}
</style>
