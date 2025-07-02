<template>
    <div class="catalog-page">
      <div class="container">
        <nav class="breadcrumbs" v-scroll-reveal="'fade-in'">
          <NuxtLink to="/">Главная</NuxtLink>
          <span class="breadcrumbs-separator">→</span>
          <span>Каталог</span>
        </nav>
        <h1 class="page-title" v-scroll-reveal="'fade-in-up'">Каталог продукции</h1>
        
        <div class="catalog-grid">
          <div 
            v-for="(category, index) in categories" 
            :key="category.slug" 
            class="catalog-item"
            v-scroll-reveal="index % 2 === 0 ? 'slide-in-left' : 'slide-in-right'"
          >
            
            <NuxtLink :to="`/catalog/${category.slug}`">
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
            <div :to="`/catalog/${category.slug}`" class="catalog-item__content">
              <h2>{{ category.title }}</h2>
              <p>{{ category.description }}</p>
              <NuxtLink :to="`/catalog/${category.slug}`" class="btn btn-primary">Подробнее</NuxtLink>
            </div>
          </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  
  interface Category {
    id: string;
    title: string;
    slug: string;
    images: string[];
    description: string;
    currentImageIndex: number;
  }
  
  const { data: fetchedCategories, pending, error: fetchError } = await useFetch<Category[]>('/api/categories');
  
  const categories = ref<Category[]>([]);
  if (fetchedCategories.value) {
    categories.value = fetchedCategories.value.map(cat => ({
      ...cat,
      currentImageIndex: 0
    }));
  } else if (fetchError.value) {
    console.error('Error loading categories:', fetchError.value);
  }
  
  // Автоматическая смена изображений
  let intervalId: NodeJS.Timeout;
  
  const startImageRotation = () => {
    intervalId = setInterval(() => {
      categories.value.forEach(category => {
        if (category.images.length > 1) {
          category.currentImageIndex = (category.currentImageIndex + 1) % category.images.length;
        }
      });
    }, 5000); // Смена каждые 5 секунд
  };
  
  onMounted(() => {
    startImageRotation();
  });
  
  onBeforeUnmount(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });
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
    padding-top: 60px; /* Добавляем отступ сверху для изображений */
  }
  
  .catalog-item {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: visible; /* Меняем на visible для выступающего изображения */
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
    margin-top: 40px; /* Добавляем отступ для изображения */
  }
  
  .catalog-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  .catalog-item__image-container {
    position: absolute;
    width: 200px; /* Фиксированная ширина для изображения */
    height: 200px; /* Фиксированная высота для изображения */
    top: -100px; /* Поднимаем изображение над карточкой */
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
  }
  
  .catalog-item__image {
    width: 100%;
    height: 100%;
    object-fit: contain; /* Меняем на contain для сохранения пропорций */
    transition: transform 0.3s ease;
  }
  
  .catalog-item__content {
    padding: 120px 20px 20px; /* Увеличиваем верхний padding для изображения */
    text-align: center;
    background: #fff;
    position: relative;
    z-index: 1;
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
    border-radius: 4px;
    transition: background-color 0.3s ease;
  }
  
  .btn-primary:hover {
    background-color: #c41a1f;
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
    