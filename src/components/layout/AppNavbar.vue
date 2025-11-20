<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import Icon from '@/components/ui/Icon.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const isMenuOpen = ref(false)

const navItems = [
  { name: 'Главная', to: '/' },
  { name: 'Дашборд', to: '/dashboard' },
  { name: 'Загрузить ZIP', to: '/dashboard' },
]

const isAuthPage = computed(() => route.name === 'auth')

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>

<template>
  <header class="navbar">
    <div class="navbar__content">
      <RouterLink class="navbar__logo" to="/">
        <span class="logo-mark">zip</span>
        <span class="logo-clone">drop</span>
      </RouterLink>

      <nav v-show="false" :class="['navbar__links', { 'navbar__links--open': isMenuOpen }]">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="navbar__link"
          active-class="navbar__link--active"
        >
          {{ item.name }}
        </RouterLink>
      </nav>

      <div class="navbar__auth">
        <button
          class="navbar__theme-toggle"
          type="button"
          :title="themeStore.currentTheme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'"
          @click="themeStore.toggleTheme"
        >
          <Icon v-if="themeStore.currentTheme === 'dark'" name="sun" :size="18" />
          <Icon v-else name="moon" :size="18" />
        </button>
        <template v-if="!isAuthPage">
          <template v-if="authStore.isAuthenticated">
            <span class="navbar__user">{{ authStore.currentUser?.email }}</span>
            <button class="btn btn--ghost navbar__logout" type="button" @click="handleLogout">
              Выйти
            </button>
          </template>
          <RouterLink v-else class="navbar__cta" to="/auth"> Войти </RouterLink>
        </template>
      </div>

      <button class="navbar__burger" type="button" @click="toggleMenu">
        <span />
        <span />
        <span />
      </button>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  border-bottom: 1px solid var(--border-strong);
  backdrop-filter: blur(8px);
  position: sticky;
  top: 0;
  z-index: 10;
  background: color-mix(in srgb, var(--surface-card) 86%, transparent);
}

.navbar__content {
  width: min(1200px, 92vw);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 64px;
}

.navbar__logo {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-primary);
}

.logo-mark {
  color: var(--accent-primary);
}

.logo-clone {
  color: var(--text-secondary);
}

.navbar__links {
  display: flex;
  gap: 1rem;
}

.navbar__link {
  color: var(--text-secondary);
  font-size: 0.95rem;
  padding: 0.35rem 0.1rem;
  border-bottom: 2px solid transparent;
}

.navbar__link:hover {
  color: var(--text-primary);
}

.navbar__link--active {
  color: var(--text-primary);
  border-bottom-color: var(--accent-primary);
}

.navbar__cta {
  padding: 0.55rem 1.2rem;
  border-radius: 999px;
  border: 1px solid transparent;
  background: var(--accent-primary);
  color: #04111f;
  font-weight: 600;
}

.navbar__cta:hover {
  background: var(--accent-primary-strong);
}

.navbar__auth {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.navbar__theme-toggle {
  background: none;
  border: 1px solid var(--border-strong);
  border-radius: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  line-height: 1;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: var(--text-secondary);
}

.navbar__theme-toggle:hover {
  color: var(--text-primary);
  border-color: var(--accent-primary);
  background: color-mix(in srgb, var(--accent-primary) 10%, transparent);
}

.navbar__user {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.navbar__logout {
  padding: 0.55rem 1.2rem;
  font-size: 0.9rem;
}

.navbar__burger {
  display: none;
  flex-direction: column;
  gap: 0.2rem;
  background: none;
  border: none;
  padding: 0.4rem;
}

.navbar__burger span {
  width: 20px;
  height: 2px;
  background: var(--text-primary);
}

@media (max-width: 768px) {
  .navbar__links {
    position: absolute;
    inset: 64px 0 auto;
    flex-direction: column;
    background: var(--surface-card);
    padding: 1rem;
    display: none;
  }

  .navbar__links--open {
    display: flex;
  }

  .navbar__burger {
    display: inline-flex;
  }
}
</style>
