<template>
  <div class="catalog container">
    <h2 class="catalog__title">Категории товаров</h2>
    <div class="catalog__grid">
      <NuxtLink
        v-for="category in categories"
        :key="category"
        :to="`/catalog/${encodeURIComponent(category)}`"
        class="catalog__card card"
      >
        <div class="catalog__img-wrapper">
          <img
            :src="getCategoryImage(category)"
            :alt="category"
            class="catalog__card-img"
          />
        </div>
        <h3 class="catalog__card-name">{{ category }}</h3>
        <p class="catalog__card-desc">{{ getCategoryCount(category) }} товаров</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Product {
  id: number
  name: string
  description: string
  price: number
  image?: string
  category: string
}

const products = ref<Product[]>([])
const categories = ref<string[]>([])

function getCategoryCount(category: string): number {
  return products.value.filter(p => p.category === category).length
}

function getCategoryImage(category: string): string {
  const categoryProducts = products.value.filter(p => p.category === category)
  return categoryProducts.length > 0 ? categoryProducts[0].image || '/placeholder.jpg' : '/placeholder.jpg'
}

async function loadProducts() {
  try {
    products.value = await $fetch<Product[]>('/api/products')
    // Получаем уникальные категории из товаров
    categories.value = [...new Set(products.value.map(p => p.category))]
  } catch (e) {
    console.error('Ошибка загрузки товаров:', e)
  }
}

onMounted(loadProducts)
</script>

<style lang="scss" scoped>
.catalog {
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 2rem;
  }

  &__title {
    font-size: 1.5rem;
    margin-top: 1rem;
    margin-bottom: 3rem;
    text-align: center;
    color: var(--text);

    @media (min-width: 768px) {
      font-size: 2rem;
      margin-top: 2rem;
      margin-bottom: 5rem;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem 1rem;

    @media (min-width: 768px) {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
    }
  }

  &__card {
    position: relative;
    padding-top: 80px;
    overflow: visible;
    text-decoration: none;
    color: inherit;
    transition: transform .2s, box-shadow .2s;
    background: var(--bg);
    border-radius: 0.5rem;
    padding: 1rem;
    padding-top: 100px;

    @media (min-width: 768px) {
      padding-top: 100px;
    }

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0,0,0,0.15);
    }
  }

  &__img-wrapper {
    position: absolute;
    top: -50px;
    left: 50%;
    transform: translateX(-50%);
    width: 140px;
    height: 140px;
    overflow: visible;
    pointer-events: none;

    @media (min-width: 768px) {
      top: -70px;
      width: 180px;
      height: 180px;
    }
  }

  &__card-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &__card-name {
    margin-top: 0.5rem;
    font-size: 1.1rem;
    color: var(--text);
    text-align: center;

    @media (min-width: 768px) {
      margin-top: 1rem;
      font-size: 1.2rem;
    }
  }

  &__card-desc {
    font-size: 0.9rem;
    color: var(--secondary);
    margin: 0.5rem 0;
    text-align: center;
    line-height: 1.4;

    @media (min-width: 768px) {
      font-size: 0.95rem;
      margin: 0.5rem 0;
    }
  }
}
</style>
  