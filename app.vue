<template>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <!-- Оборачиваем всё в наш дефолтный лейаут -->
  <NuxtLayout>
    <FrogModal />
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Подключаем тему, чтобы установить атрибут data-theme при старте
import { useTheme } from "@/composables/useTheme";
import { useVisitTracking } from "~/composables/useVisitTracking";

const { theme, setTheme } = process.client
  ? useTheme()
  : { theme: ref("light"), setTheme: () => {} };

// Инициализируем отслеживание посещений
const { trackVisit, error: trackingError } = process.client
  ? useVisitTracking()
  : { trackVisit: () => {}, error: ref(null) };
import { contacts } from "~/data/contacts";

// Отслеживаем посещение при загрузке приложения
onMounted(() => {
  if (process.client) {
    trackVisit();
  }
});

// Логируем ошибки отслеживания
if (process.client) {
  watch(trackingError, (error) => {
    if (error) {
      console.error("Visit tracking error:", error);
    }
  });
}

if (process.client) {
  useSeoMeta({
    titleTemplate: (title) => "КотлоЭнергоСнаб",
  });
}
</script>

<style lang="scss">
// Переменные CSS перенесены в collection/_colors.scss
// Базовые стили перенесены в global/_base.scss
// Grid стили перенесены в отдельный файл

// Только специфичные для app.vue стили
:root {
  /* Modal overlay */
  --frog-modal-transition: visibility 0.2s, opacity 0.2s;
  --frog-modal-overlay-opacity: 0.5;
  --frog-modal-overlay-background: #0e151e;

  /* Animation timing */
  --frog-modal-animation-duration: 0.3s;
  --frog-modal-animation-timing: ease-in-out;
}
</style>
