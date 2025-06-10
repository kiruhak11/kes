<template>
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
</script>
