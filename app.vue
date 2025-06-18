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
import { useVisitTracking } from '~/composables/useVisitTracking'

const { theme, setTheme } = useTheme();

// Инициализируем отслеживание посещений
const { trackVisit, error: trackingError } = useVisitTracking()
import { contacts } from '~/data/contacts'

// При монтировании на клиенте выставим сохранённую тему
if (process.client) {
  setTheme(theme.value === "dark" ? "dark" : "light");
}

// Отслеживаем посещение при загрузке приложения
onMounted(() => {
  trackVisit()
})

// Логируем ошибки отслеживания
watch(trackingError, (error) => {
  if (error) {
    console.error('Visit tracking error:', error)
  }
})

useSeoMeta({
  titleTemplate: (title) => "КотлоЭнергоСнаб"
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

:root {
  --primary-color: #e31e24;
  --primary-hover: #c41820;
  --text-color: #333;
  --text-light: #666;
  --bg-color: #fff;
  --bg-light: #f5f5f5;
  --border-color: #ddd;

  /* Modal overlay */
  --frog-modal-transition: visibility 0.2s, opacity 0.2s;
  --frog-modal-overlay-opacity: 0.5;
  --frog-modal-overlay-background: #0e151e;

  /* Animation timing */
  --frog-modal-animation-duration: 0.3s;
  --frog-modal-animation-timing: ease-in-out;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Roboto', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: var(--text-color);
  background: var(--bg-color);
}

a {
  text-decoration: none;
  color: inherit;
}

ul, ol {
  list-style: none;
}

button {
  cursor: pointer;
  border: none;
  background: none;
  font: inherit;
}

img {
  max-width: 100%;
  height: auto;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.btn {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 4px;
  font-weight: 500;
  text-align: center;
  transition: all 0.3s ease;
}

.btn-primary {
  background: var(--primary-color);
  color: #fff;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.section-title {
  text-align: center;
  margin-bottom: 40px;
  font-size: 2rem;
}

.grid {
  display: grid;
  gap: 20px;
}

.grid-2 {
  grid-template-columns: repeat(2, 1fr);
}

.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.grid-4 {
  grid-template-columns: repeat(4, 1fr);
}

@media (max-width: 1200px) {
  .container {
    max-width: 960px;
  }
}

@media (max-width: 992px) {
  .container {
    max-width: 720px;
  }
  
  .grid-4 {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .container {
    max-width: 540px;
  }
  
  .grid-3, .grid-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .container {
    max-width: 100%;
  }
  
  .grid-2, .grid-3, .grid-4 {
    grid-template-columns: 1fr;
  }
}
</style>
