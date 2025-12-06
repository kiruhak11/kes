<template>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <!-- Оборачиваем всё в наш дефолтный лейаут -->
  <NuxtLayout>
    <FrogModal />
    <NuxtPage />
  </NuxtLayout>

  <a
    class="yandex-counter"
    href="https://webmaster.yandex.ru/siteinfo/?site=https://kes-sib.ru"
    ><img
      width="88"
      height="31"
      alt=""
      border="0"
      border-radius="8"
      src="https://yandex.ru/cycounter?https://kes-sib.ru&theme=light&lang=ru"
  /></a>
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
.yandex-counter {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 1000;
  visibility: hidden;
  opacity: 0;
  transition: visibility 0.2s, opacity 0.2s;
  &:hover {
    visibility: visible;
    opacity: 1;
  }
}
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
