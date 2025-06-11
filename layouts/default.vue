<!-- layouts/default.vue -->
<template>
  <div class="app-wrapper">
    <!-- Шапка только на десктопе -->
    <Header v-if="!device.isMobile" />

    <main class="app-content">
      <NuxtPage />
    </main>

    <Footer />

    <!-- Нижнее меню только на мобильном -->
    <BottomNav v-if="device.isMobile" />
  </div>
</template>

<script setup lang="ts">
// хук из @nuxtjs/device
const device = useDevice()
</script>

<style lang="scss" scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.app-content {
  flex: 1;
  padding-bottom: 60px;
}

/* Подвинуть контент вверх на высоту BottomNav */
@media (max-width: 768px) {
  .app-content {
    padding-bottom: 60px; /* высота вашего BottomNav */
  }
}
</style>
