<template>
  <div class="catalog-page">
    <div class="container">
      <nav class="breadcrumbs" v-scroll-reveal="'fade-in'">
        <NuxtLink to="/">Главная</NuxtLink>
        <span class="breadcrumbs-separator">→</span>
        <span>Каталог</span>
      </nav>
      <h1 class="page-title" v-scroll-reveal="'fade-in-up'">
        Каталог продукции
      </h1>

      <div class="catalog-grid">
        <NuxtLink
          v-for="(category, index) in paginatedCategories"
          :key="category.slug"
          :to="`/catalog/${category.slug}`"
          class="catalog-item"
          v-scroll-reveal="index % 2 === 0 ? 'slide-in-left' : 'slide-in-right'"
          :data-category-id="category.id"
        >
          <div class="catalog-item__image-container">
            <transition-group name="fade">
              <img
                v-for="(image, index) in category.images"
                :key="image"
                :src="image"
                :alt="category.title"
                v-show="index === category.currentImageIndex"
                class="catalog-item__image"
              />
            </transition-group>
          </div>
          <div class="catalog-item__content">
            <h2>{{ category.title }}</h2>
            <p>{{ category.description }}</p>
            <span class="btn btn-primary">Подробнее</span>
          </div>
        </NuxtLink>
      </div>

      <div class="pagination" v-if="totalPages > 1">
        <button
          class="btn btn-secondary"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          Назад
        </button>
        <span class="page-info"
          >Страница {{ currentPage }} из {{ totalPages }}</span
        >
        <button
          class="btn btn-secondary"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          Вперед
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";

// SEO Meta Tags
useHead({
  title: "Каталог продукции — КотлоЭнергоСнаб",
  meta: [
    {
      name: "description",
      content:
        "Каталог котельного оборудования КотлоЭнергоСнаб. Котлы, котельные, теплообменники, водоподготовка. Производство и монтаж в Барнауле.",
    },
    {
      name: "keywords",
      content:
        "КотлоЭнергоСнаб, каталог, котельное оборудование, котлы, котельные, теплообменники, водоподготовка, Барнаул",
    },
    { name: "author", content: "КотлоЭнергоСнаб" },
    { property: "og:site_name", content: "КотлоЭнергоСнаб" },
    { property: "og:title", content: "Каталог продукции — КотлоЭнергоСнаб" },
    {
      property: "og:description",
      content:
        "Каталог котельного оборудования КотлоЭнергоСнаб. Котлы, котельные, теплообменники, водоподготовка. Производство и монтаж в Барнауле.",
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://kes-sib.ru/catalog" },
    { property: "og:image", content: "/images/hero1.jpg" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Каталог продукции — КотлоЭнергоСнаб" },
    {
      name: "twitter:description",
      content:
        "Каталог котельного оборудования КотлоЭнергоСнаб. Котлы, котельные, теплообменники, водоподготовка. Производство и монтаж в Барнауле.",
    },
    { name: "robots", content: "index, follow" },
  ],
  link: [
    { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    { rel: "canonical", href: "https://kes-sib.ru/catalog" },
  ],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "http://schema.org",
        "@type": "Organization",
        name: "КотлоЭнергоСнаб",
        url: "https://kes-sib.ru/",
        logo: "https://kes-sib.ru/favicon.ico",
      }),
    },
  ],
});

interface Category {
  id: string;
  title: string;
  slug: string;
  images: string[];
  image?: string;
  description: string;
  currentImageIndex: number;
  intervalId?: number | null;
}

const { data: categories } = await useFetch<{ categories: Category[] }>(
  "/api/categories",
  {
    key: "categories-list",
    transform: (response) => {
      if (!response) {
        console.error("Empty response");
        return { categories: [] };
      }

      // Проверяем, если response уже имеет нужную структуру
      if (response.categories && Array.isArray(response.categories)) {
        return {
          categories: response.categories.map((category: any) => ({
            id: category.id || "",
            title: category.name || "",
            description: category.description || "",
            image: category.image || "",
            slug: category.slug || "",
            images: category.images || [category.image || ""],
            currentImageIndex: 0,
            intervalId: null,
          })),
        };
      }

      console.error("Invalid response format:", response);
      return { categories: [] };
    },
    lazy: true,
    server: false,
  }
);

const { optimizeImageSize } = useImageOptimization();

// Используем IntersectionObserver для автоматической смены изображений
const startImageRotation = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const element = entry.target as HTMLElement;
        const categoryId = element.getAttribute("data-category-id");
        const category = categories.value?.categories.find(
          (cat: Category) => cat.id === categoryId
        );
        if (entry.isIntersecting && category) {
          if (!category.intervalId) {
            category.intervalId = window.setInterval(() => {
              if (category.images.length > 1) {
                category.currentImageIndex =
                  (category.currentImageIndex + 1) % category.images.length;
              }
            }, 5000);
          }
        } else if (category && category.intervalId) {
          clearInterval(category.intervalId);
          category.intervalId = null;
        }
      });
    },
    { threshold: 0.5 }
  );

  // Наблюдаем за каждой карточкой категории
  document.querySelectorAll(".catalog-item").forEach((item) => {
    observer.observe(item);
  });

  return observer;
};

let imageObserver: IntersectionObserver;

onMounted(() => {
  imageObserver = startImageRotation();
});

onBeforeUnmount(() => {
  if (imageObserver) {
    imageObserver.disconnect();
  }
  // Очищаем все интервалы
  categories.value?.categories.forEach((category: Category) => {
    if (category.intervalId) {
      clearInterval(category.intervalId);
      category.intervalId = null;
    }
  });
});

// Пагинация
const currentPage = ref(1);
const itemsPerPage = 20;

const totalPages = computed(() => {
  if (!categories.value?.categories) return 1;
  return Math.ceil(categories.value.categories.length / itemsPerPage);
});

const paginatedCategories = computed(() => {
  if (!categories.value?.categories) return [];

  const start = (currentPage.value - 1) * itemsPerPage;
  return categories.value.categories.slice(start, start + itemsPerPage);
});

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}
</script>

<style scoped>
.catalog-page {
  padding: 40px 0;
}

.page-title {
  text-align: center;
  margin-bottom: 40px;
  font-size: 2.5rem;
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  padding-top: 60px;
}

.catalog-item {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: visible;
  transition: all 0.3s ease;
  position: relative;
  margin-top: 75px;
  text-decoration: none;
  color: inherit;
  display: block;
}

.catalog-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.catalog-item:hover .catalog-item__image {
  transform: scale(1.05);
}

.catalog-item:hover .btn-primary {
  background-color: #c41a1f;
}

.catalog-item__image-container {
  position: absolute;
  width: 200px;
  height: 200px;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  border-radius: 12px;
  overflow: hidden;
}

.catalog-item__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.catalog-item__content {
  padding: 120px 20px 20px;
  text-align: center;
  background: #fff;
  position: relative;
  z-index: 1;
  border-radius: 12px;
}

.catalog-item h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #333;
}

.catalog-item p {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
}

.btn-primary {
  display: inline-block;
  padding: 10px 20px;
  background-color: #e31e24;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.3s ease;
}

/* Анимации для смены изображений */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1200px) {
  .catalog-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .catalog-grid {
    grid-template-columns: 1fr;
    gap: 64px;
  }

  .page-title {
    font-size: 2rem;
  }

  .catalog-item__image-container {
    width: 150px;
    height: 150px;
    top: -75px;
  }

  .catalog-item__content {
    padding-top: 90px;
  }
}

.breadcrumbs {
  display: flex;
  align-items: center;
  font-size: 1rem;
  margin-bottom: 24px;
  gap: 8px;
}

.breadcrumbs-separator {
  color: #aaa;
  margin: 0 4px;
}

.breadcrumbs a {
  color: #e31e24;
  text-decoration: none;
  transition: text-decoration 0.2s;
}

.breadcrumbs a:hover {
  text-decoration: underline;
}
</style>
