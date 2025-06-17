<template>
    <div class="catalog-page">
      <div class="container">
        <h1 class="page-title">Каталог продукции</h1>
        
        <div class="catalog-grid">
          <div v-for="category in categories" :key="category.slug" class="catalog-item">
            <img :src="category.image" :alt="category.title" />
            <div class="catalog-item__content">
              <h2>{{ category.title }}</h2>
              <p>{{ category.description }}</p>
              <NuxtLink :to="`/catalog/${category.slug}`" class="btn btn-primary">Подробнее</NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  
  interface Category {
    title: string;
    slug: string;
    image: string;
    description: string;
  }
  
  const { data: fetchedCategories, pending, error: fetchError } = await useFetch<Category[]>('/api/categories');
  
  const categories = ref<Category[]>([]);
  if (fetchedCategories.value) {
    categories.value = fetchedCategories.value;
  } else if (fetchError.value) {
    console.error('Error loading categories:', fetchError.value);
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
  }
  
  .catalog-item {
    background: #fff;
    border-radius: 8px;
    margin-top: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: visible;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
    padding-top: 60px;
  }
  
  .catalog-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  .catalog-item img {
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 120px;
    object-fit: contain;
    z-index: 2;
  }
  
  .catalog-item__content {
    padding: 20px;
    text-align: center;
    position: relative;
    z-index: 1;
  }
  
  .catalog-item h2 {
    font-size: 1.5rem;
    margin-bottom: 10px;
  }
  
  .catalog-item p {
    color: #666;
    margin-bottom: 20px;
    line-height: 1.6;
  }
  
  @media (max-width: 1200px) {
    .catalog-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (max-width: 768px) {

    .catalog-grid {
      grid-template-columns: 1fr;
    }
    
    .page-title {
      font-size: 2rem;
    }
  }
  </style>
    