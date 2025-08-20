<template>
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <!-- Yandex.Metrika counter -->
  <script type="text/javascript">
    (function (m, e, t, r, i, k, a) {
      m[i] =
        m[i] ||
        function () {
          (m[i].a = m[i].a || []).push(arguments);
        };
      m[i].l = 1 * new Date();
      for (var j = 0; j < document.scripts.length; j++) {
        if (document.scripts[j].src === r) {
          return;
        }
      }
      (k = e.createElement(t)),
        (a = e.getElementsByTagName(t)[0]),
        (k.async = 1),
        (k.src = r),
        a.parentNode.insertBefore(k, a);
    })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

    ym(103178484, "init", {
      webvisor: true,
      clickmap: true,
      accurateTrackBounce: true,
      trackLinks: true,
    });
  </script>
  <noscript
    ><div>
      <img
        src="https://mc.yandex.ru/watch/103178484"
        style="position: absolute; left: -9999px"
        alt=""
      /></div
  ></noscript>
  <!-- /Yandex.Metrika counter -->

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
