<template>
  <footer class="footer">
    <div class="footer__content">
      <p>© {{ new Date().getFullYear() }} ZipDrop</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--border-strong);
  padding: 1.5rem 0;
  background: color-mix(in srgb, var(--surface-card) 92%, transparent);
}

.footer__content {
  width: min(1200px, 92vw);
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

</style>
