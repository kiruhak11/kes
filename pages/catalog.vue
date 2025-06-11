<template>
  <div class="catalog container">
    <h1 class="catalog__title">Каталог товаров</h1>
    
    <div class="catalog__categories">
      <NuxtLink
        v-for="category in categories"
        :key="category.id"
        :to="`/catalog/${category.id}`"
        class="catalog__category"
      >
        <div class="catalog__category-img">
          <img :src="category.image || '/placeholder.jpg'" :alt="category.name" />
        </div>
        <h3 class="catalog__category-name">{{ category.name }}</h3>
        <p class="catalog__category-count">{{ category.productCount || 0 }} товаров</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Category {
  id: number
  name: string
  image?: string
  productCount?: number
}

const categories = ref<Category[]>([])

async function loadCategories() {
  try {
    categories.value = await $fetch<Category[]>('/api/categories')
  } catch (e) {
    console.error('Ошибка загрузки категорий:', e)
  }
}

onMounted(loadCategories)
</script>

<style lang="scss" scoped>
.catalog {
  padding: 2rem 1rem;

  &__title {
    font-size: 2rem;
    margin-bottom: 2rem;
    text-align: center;
  }

  &__categories {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 2rem;
  }

  &__category {
    display: flex;
    flex-direction: column;
    background: var(--bg);
    border-radius: 0.5rem;
    overflow: hidden;
    transition: transform 0.2s;
    text-decoration: none;
    color: var(--text);

    &:hover {
      transform: translateY(-5px);
    }
  }

  &__category-img {
    position: relative;
    padding-top: 75%;
    background: var(--bg-secondary);

    img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__category-name {
    font-size: 1.2rem;
    margin: 1rem;
    color: var(--text);
  }

  &__category-count {
    margin: 0 1rem 1rem;
    color: var(--text-secondary);
  }
}
</style> 