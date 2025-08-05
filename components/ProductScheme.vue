<template>
  <div
    v-if="activeTab === 'scheme'"
    class="section-block"
    v-scroll-reveal="'slide-in-right'"
  >
    <h2 class="section-title">Схема подключения</h2>
    <div v-if="connectionScheme" class="scheme-image-container">
      <NuxtImg
        :src="normalizeImagePath(connectionScheme)"
        alt="Схема подключения"
        class="scheme-image"
        format="webp"
        quality="90"
        loading="lazy"
        sizes="(max-width: 768px) 100vw, 800px"
      />
    </div>
    <div v-else class="no-data-message">Схема подключения уточняется.</div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  activeTab: string;
  connectionScheme?: string;
}

defineProps<Props>();

// Добавляем функцию нормализации путей изображений
function normalizeImagePath(path: string | undefined): string {
  if (!path) return "/images/placeholders/placeholder.png";

  // Если путь уже начинается с /api/uploads/, оставляем как есть
  if (path.startsWith("/api/uploads/")) {
    return path;
  }

  // Если путь начинается с /uploads/, добавляем /api
  if (path.startsWith("/uploads/")) {
    return `/api${path}`;
  }

  // Если путь абсолютный (начинается с /), возвращаем как есть
  if (path.startsWith("/")) {
    return path;
  }

  // В остальных случаях предполагаем, что это относительный путь к uploads
  if (path.includes("uploads/")) {
    return `/api/${path}`;
  }

  return path;
}
</script>

<style scoped lang="scss">
.section-block {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  padding: 32px 24px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.4rem;
  margin-bottom: 18px;
  color: #ff6b6b;
  font-weight: 700;
  text-align: left;
}

.scheme-image-container {
  text-align: center;
}

.scheme-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  border: 1px solid #eee;
}

.no-data-message {
  text-align: center;
  font-size: 1.1rem;
  color: #999;
  padding: 40px 0;
}

@media (max-width: 768px) {
  .section-block {
    padding: 16px 12px;
  }

  .section-title {
    font-size: 1.2rem;
  }
}
</style>
