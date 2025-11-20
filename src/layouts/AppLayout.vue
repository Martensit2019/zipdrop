<script setup lang="ts">
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
</script>

<template>
  <div class="app-shell">
    <AppNavbar />
    <main class="app-main">
      <div class="content-container">
        <slot />
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: var(--surface-muted);
  color: var(--text-primary);
}

.app-main {
  padding: clamp(1rem, 3vw, 2.5rem) 0;
}

.content-container {
  width: min(1200px, 92vw);
  margin: 0 auto;
}
</style>
