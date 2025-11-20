import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from '@/router'
import '@/style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Инициализация темы после создания Pinia
import { useThemeStore } from '@/stores/theme'
const themeStore = useThemeStore()
themeStore.setTheme(themeStore.currentTheme)

app.mount('#app')
