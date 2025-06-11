<template>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <!-- Оборачиваем всё в наш дефолтный лейаут -->
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Подключаем тему, чтобы установить атрибут data-theme при старте
import { useTheme } from "@/composables/useTheme";

const { theme, setTheme } = useTheme();

// При монтировании на клиенте выставим сохранённую тему
if (process.client) {
  setTheme(theme.value === "dark" ? "dark" : "light");
}


useSeoMeta({
  titleTemplate: (title) => "КотлоЭнергоСнаб"
});
</script>
