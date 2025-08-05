<template>
  <nav
    class="breadcrumbs"
    :class="{ 'no-reveal': isMobile }"
    v-scroll-reveal="!isMobile && 'fade-in'"
  >
    <NuxtLink to="/">Главная</NuxtLink>
    <span class="breadcrumbs-separator">→</span>
    <NuxtLink to="/catalog">Каталог</NuxtLink>
    <span class="breadcrumbs-separator">→</span>
    <NuxtLink :to="`/catalog/${categorySlug}`">{{
      categoryInfo?.title || "Категория"
    }}</NuxtLink>
    <span class="breadcrumbs-separator">→</span>
    <span>{{ productName }}</span>
  </nav>
</template>

<script setup lang="ts">
interface Props {
  categorySlug: string;
  categoryInfo?: {
    title: string;
    description: string;
    slug: string;
  };
  productName: string;
  isMobile: boolean;
}

defineProps<Props>();
</script>

<style scoped lang="scss">
.breadcrumbs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 1rem;
  margin-bottom: 24px;
  gap: 8px;
  line-height: 1.4;
  color: var(--primary-hover);

  a {
    color: var(--primary);
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: var(--primary-hover);
      text-decoration: underline;
    }
  }

  span {
    color: var(--text-light);

    &.breadcrumbs-separator {
      color: var(--text-light);
      margin: 0;
      opacity: 0.5;
    }

    &:last-child {
      color: var(--text);
      font-weight: 500;
    }
  }

  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin: 0 -12px 16px;
    padding: 12px;
    background: #fff;
    border-radius: 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    position: relative;

    a {
      display: flex;
      align-items: center;
      color: var(--text);
      font-weight: 500;

      &:first-child {
        &::before {
          content: "";
          display: inline-block;
          width: 20px;
          height: 20px;
          margin-right: 8px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M15 18l-6-6 6-6'/%3E%3C/svg%3E");
          background-size: contain;
          background-repeat: no-repeat;
          opacity: 0.7;
        }
      }
    }

    // Показываем только "Назад в категорию"
    a,
    span {
      display: none;

      &:nth-last-child(4) {
        // Ссылка на категорию
        display: flex;
        width: 100%;
      }
    }

    // Скрываем все разделители
    .breadcrumbs-separator {
      display: none;
    }
  }

  @media (max-width: 480px) {
    font-size: 0.875rem;
    padding: 10px 12px;

    a:first-child::before {
      width: 18px;
      height: 18px;
      margin-right: 6px;
    }
  }
}

// Добавляем стили для мобильной версии
.no-reveal {
  opacity: 1 !important;
  transform: none !important;
  visibility: visible !important;
}
</style>
