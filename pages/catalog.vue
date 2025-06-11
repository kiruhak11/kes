<template>
  <div class="catalog container">
    <h2 class="catalog__title">Категории товаров</h2>
    <div class="catalog__grid">
      <NuxtLink
        v-for="category in categories"
        :key="category.id"
        :to="`/catalog/${category.id}`"
        class="catalog__card card"
      >
        <div class="catalog__img-wrapper">
          <img
            :src="category.image || '/placeholder.jpg'"
            :alt="category.name"
            class="catalog__card-img"
          />
        </div>
        <h3 class="catalog__card-name">{{ category.name }}</h3>
        <p class="catalog__card-desc">{{ category.count }} товаров</p>
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
  count: number
}

const categories = ref<Category[]>([])

async function loadCategories() {
  try {
    console.log('Loading categories...')
    const response = await $fetch<Category[]>('/api/categories')
    console.log('Received categories:', response)
    categories.value = response
  } catch (e) {
    console.error('Ошибка загрузки каталога:', e)
  }
}

onMounted(loadCategories)
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

  &__card-price {
    font-weight: 600;
    color: var(--accent);
    text-align: center;
    font-size: 0.95rem;

    @media (min-width: 768px) {
      font-size: 1rem;
    }
  }
}
</style>
