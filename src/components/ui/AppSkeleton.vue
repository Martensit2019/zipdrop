<script setup lang="ts">
interface Props {
  width?: string
  height?: string
  lines?: number
}

withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '1rem',
  lines: 1,
})
</script>

<template>
  <div v-for="i in lines" :key="i" class="skeleton" :style="{ width, height }" />
</template>

<style scoped>
.skeleton {
  background: linear-gradient(
    90deg,
    var(--surface-muted) 0%,
    color-mix(in srgb, var(--surface-muted) 80%, transparent) 50%,
    var(--surface-muted) 100%
  );
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
  border-radius: 0.25rem;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>

