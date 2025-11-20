<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Icon from '@/components/ui/Icon.vue'

const authStore = useAuthStore()
const isAnimating = ref(false)

const highlights = [
  {
    icon: 'lightning' as const,
    title: 'Загрузите ZIP за секунды',
    description:
      'Drag-n-drop или выбор файла, прогресс в реальном времени и мгновенная публикация. Поддержка архивов до 50MB.',
  },
  {
    icon: 'chart' as const,
    title: 'Общий дашборд',
    description:
      'Сводка по проектам, веса, публичные ссылки и статус развертывания. Управление всеми проектами в одном месте.',
  },
  {
    icon: 'link' as const,
    title: 'Стабильный предпросмотр',
    description:
      'Каждый проект получает отдельный URL и fallback UI при ошибках. Публичные ссылки работают мгновенно.',
  },
  {
    icon: 'lock' as const,
    title: 'Безопасность',
    description:
      'JWT-аутентификация, защищённые маршруты и приватные проекты. Полный контроль доступа к вашим данным.',
  },
]

const useCases = [
  {
    title: 'Демо для клиентов',
    description:
      'Загрузите прототип и отправьте ссылку заказчику. Не нужно настраивать сервер или деплой.',
  },
  {
    title: 'Портфолио разработчика',
    description:
      'Покажите свои проекты в действии. Каждый проект получает уникальный URL для резюме.',
  },
  {
    title: 'Быстрое тестирование',
    description:
      'Протестируйте статический сайт перед деплоем на продакшн. Идеально для проверки сборок.',
  },
]

const steps = [
  { step: '1', text: 'Зарегистрируйтесь или войдите' },
  { step: '2', text: 'Загрузите ZIP-архив проекта' },
  { step: '3', text: 'Получите публичную ссылку' },
  { step: '4', text: 'Делитесь с командой или клиентами' },
]

onMounted(() => {
  isAnimating.value = true
})
</script>

<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero__copy">
        <p class="eyebrow">ZIPDROP · MVP</p>
        <h1 class="hero__title">
          Хостинг статических проектов
          <span class="gradient-text">за секунды</span>
        </h1>
        <p class="hero__description">
          Загрузите архив, получите ссылку, делитесь проектом с командой или заказчиком. Всё
          происходит в браузере без CLI и сложных настроек.
        </p>
        <div class="hero__cta">
          <RouterLink
            v-if="!authStore.isAuthenticated"
            to="/auth"
            class="btn btn--primary btn--large"
          >
            Начать бесплатно
          </RouterLink>
          <RouterLink v-else to="/dashboard" class="btn btn--primary btn--large">
            Перейти в дашборд
          </RouterLink>
          <a href="#features" class="btn btn--ghost btn--large"> Узнать больше </a>
        </div>
        <div class="hero__stats">
          <div class="stat">
            <span class="stat__value">&lt; 10 сек</span>
            <span class="stat__label">Время деплоя</span>
          </div>
          <div class="stat">
            <span class="stat__value">50 MB</span>
            <span class="stat__label">Макс. размер</span>
          </div>
          <div class="stat">
            <span class="stat__value">∞</span>
            <span class="stat__label">Проектов</span>
          </div>
        </div>
      </div>
      <div class="hero__preview">
        <div class="preview-card" :class="{ 'preview-card--animate': isAnimating }">
          <div class="preview-header">
            <div class="preview-header__left">
              <Icon name="package" :size="20" class="preview-icon" />
              <span class="preview-filename">my-project.zip</span>
            </div>
            <span class="preview-percent">{{ isAnimating ? '87%' : '0%' }}</span>
          </div>
          <div class="preview-progress">
            <div class="preview-progress__bar" :style="{ width: isAnimating ? '87%' : '0%' }" />
          </div>
          <div class="preview-status">
            <span v-if="!isAnimating" class="preview-status__text">Готов к загрузке...</span>
            <span v-else class="preview-status__text">
              Распаковка и деплой занимают <strong>&lt; 10 секунд</strong>
            </span>
          </div>
          <div v-if="isAnimating" class="preview-url">
            <span class="preview-url__label">Публичная ссылка:</span>
            <code class="preview-url__code">https://abc123.zipdrop.ru</code>
            <button class="preview-url__copy" type="button" aria-label="Копировать">
              <Icon name="copy" :size="16" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features">
      <h2 class="section-title">Возможности</h2>
      <div class="grid">
        <article v-for="item in highlights" :key="item.title" class="grid-card">
          <div class="grid-card__icon">
            <Icon :name="item.icon" :size="40" />
          </div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </article>
      </div>
    </section>

    <!-- How It Works -->
    <section class="how-it-works">
      <h2 class="section-title">Как это работает</h2>
      <div class="steps">
        <div v-for="item in steps" :key="item.step" class="step">
          <div class="step__number">{{ item.step }}</div>
          <p class="step__text">{{ item.text }}</p>
        </div>
      </div>
    </section>

    <!-- Use Cases -->
    <section class="use-cases">
      <h2 class="section-title">Примеры использования</h2>
      <div class="use-cases__grid">
        <article v-for="useCase in useCases" :key="useCase.title" class="use-case-card">
          <h3>{{ useCase.title }}</h3>
          <p>{{ useCase.description }}</p>
        </article>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-card">
        <h2>Готовы начать?</h2>
        <p>Зарегистрируйтесь бесплатно и загрузите свой первый проект за минуту</p>
        <div class="cta-card__actions">
          <RouterLink
            v-if="!authStore.isAuthenticated"
            to="/auth"
            class="btn btn--primary btn--large"
          >
            Создать аккаунт
          </RouterLink>
          <RouterLink v-else to="/dashboard" class="btn btn--primary btn--large">
            Открыть дашборд
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.home {
  padding-bottom: 4rem;
}

// Hero Section
.hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 3rem;
  align-items: center;
  margin-bottom: 6rem;
  padding-top: 2rem;
}

.hero__title {
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  line-height: 1.1;
  margin: 0.5rem 0 1.5rem;
  font-weight: 700;
}

.gradient-text {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-primary-strong));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero__description {
  color: var(--text-secondary);
  max-width: 520px;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.hero__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 3rem;
}

.btn--large {
  padding: 1rem 2rem;
  font-size: 1rem;
}

.hero__stats {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
  text-align: center;
}

.stat__value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-primary);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}

.stat__label {
  font-size: 0.85rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.hero__preview {
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-card {
  min-width: min(380px, 100%);
  padding: 2rem;
  border-radius: 1.5rem;
  border: 1px solid var(--border-strong);
  background: var(--surface-card);
  box-shadow: 0 20px 60px rgba(4, 17, 31, 0.25);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.preview-card--animate {
  animation: cardPulse 0.6s ease-out;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.preview-header__left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preview-icon {
  display: flex;
  align-items: center;
  color: var(--accent-primary);
}

.preview-filename {
  color: var(--text-primary);
  font-weight: 500;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.9rem;
}

.preview-percent {
  color: var(--accent-primary);
  font-weight: 600;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.95rem;
}

.preview-progress {
  height: 8px;
  border-radius: 999px;
  background: var(--surface-muted);
  overflow: hidden;
  margin-bottom: 1rem;
}

.preview-progress__bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-primary-strong));
  border-radius: inherit;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: shimmer 2s infinite;
  }
}

.preview-status {
  margin-bottom: 1rem;
}

.preview-status__text {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
}

.preview-url {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--surface-muted);
  border-radius: 0.5rem;
  border: 1px solid var(--border-subtle);
  animation: slideIn 0.5s ease-out 0.3s both;
}

.preview-url__label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.preview-url__code {
  flex: 1;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.85rem;
  color: var(--accent-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-url__copy {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
  opacity: 0.7;
  color: var(--text-secondary);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    color 0.2s ease;

  &:hover {
    opacity: 1;
    transform: scale(1.1);
    color: var(--text-primary);
  }
}

// Features Section
.features {
  margin-bottom: 6rem;
  scroll-margin-top: 5rem;
}

.section-title {
  font-size: clamp(2rem, 4vw, 2.8rem);
  text-align: center;
  margin-bottom: 3rem;
  font-weight: 700;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
}

.grid-card {
  border: 1px solid var(--border-subtle);
  border-radius: 1.25rem;
  padding: 2rem;
  background: var(--surface-card);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: var(--border-strong);
    box-shadow: 0 10px 30px rgba(4, 17, 31, 0.2);
  }

  h3 {
    font-size: 1.3rem;
    margin-bottom: 0.75rem;
    color: var(--text-primary);
  }

  p {
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0;
  }
}

.grid-card__icon {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  color: var(--accent-primary);
}

// How It Works
.how-it-works {
  margin-bottom: 6rem;
}

.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
}

.step__number {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-primary-strong));
  color: #04111f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}

.step__text {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
  line-height: 1.5;
}

// Use Cases
.use-cases {
  margin-bottom: 6rem;
}

.use-cases__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.use-case-card {
  padding: 2rem;
  border: 1px solid var(--border-subtle);
  border-radius: 1rem;
  background: var(--surface-card);
  transition: border-color 0.2s ease;

  &:hover {
    border-color: var(--accent-primary);
  }

  h3 {
    font-size: 1.2rem;
    margin-bottom: 0.75rem;
    color: var(--text-primary);
  }

  p {
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0;
  }
}

// CTA Section
.cta-section {
  margin-top: 4rem;
}

.cta-card {
  text-align: center;
  padding: 4rem 2rem;
  border-radius: 2rem;
  background: linear-gradient(135deg, var(--surface-card), var(--surface-muted));
  border: 1px solid var(--border-strong);
  max-width: 700px;
  margin: 0 auto;

  h2 {
    font-size: clamp(2rem, 4vw, 2.5rem);
    margin-bottom: 1rem;
    font-weight: 700;
  }

  p {
    color: var(--text-secondary);
    font-size: 1.1rem;
    margin-bottom: 2rem;
    line-height: 1.6;
  }
}

.cta-card__actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

// Animations
@keyframes cardPulse {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Responsive
@media (max-width: 768px) {
  .hero {
    grid-template-columns: 1fr;
    gap: 2rem;
    margin-bottom: 4rem;
  }

  .hero__stats {
    justify-content: center;
  }

  .steps {
    grid-template-columns: 1fr;
  }

  .cta-card {
    padding: 3rem 1.5rem;
  }
}
</style>
