<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import AppToastContainer from '@/components/ui/AppToastContainer.vue'
</script>

<template>
  <AppLayout>
    <RouterView />
  </AppLayout>
  <AppToastContainer />
</template>
