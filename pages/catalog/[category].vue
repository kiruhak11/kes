<template>
  <div class="category container">
    <h2 class="category__title">{{ category }}</h2>
    <p v-if="error" class="category__error">{{ error }}</p>
    <div v-else-if="products.length === 0" class="category__empty">
      В данной категории пока нет товаров
    </div>
    <div v-else class="category__grid">
      <NuxtLink
        v-for="product in products"
        :key="product.id"
        :to="`/product/${product.id}`"
        class="category__card card"
      >
        <div class="category__img-wrapper">
          <img
            :src="product.image || '/placeholder.jpg'"
            :alt="product.name"
            class="category__card-img"
          />
        </div>
        <h3 class="category__card-name">{{ product.name }}</h3>
        <p class="category__card-desc">{{ product.description }}</p>
        <p class="category__card-price">{{ product.price }} ₽</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from '#app'

interface Product {
  id: number
  name: string
  description: string
  price: number
  image?: string
  category: string
}

const route = useRoute()
const category = ref(decodeURIComponent(route.params.category as string))
const products = ref<Product[]>([])
const error = ref<string | null>(null)

async function loadProducts() {
  try {
    error.value = null
    console.log('Loading products for category:', category.value)
    const response = await $fetch<Product[]>(`/api/categories/${encodeURIComponent(category.value)}`)
    console.log('Received products:', response)
    products.value = response
  } catch (e: any) {
    console.error('Ошибка загрузки товаров:', e)
    error.value = e.statusMessage || 'Произошла ошибка при загрузке товаров'
    products.value = []
  }
}

// Add watch for route changes
watch(() => route.params.category, (newCategory) => {
  if (newCategory) {
    category.value = decodeURIComponent(newCategory as string)
    loadProducts()
  }
})

onMounted(loadProducts)
</script>

<style lang="scss" scoped>
.category {
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

  &__error {
    color: #dc3545;
    text-align: center;
    margin: 2rem 0;
    font-size: 1.1rem;
  }

  &__empty {
    text-align: center;
    margin: 2rem 0;
    font-size: 1.1rem;
    color: var(--secondary);
  }
}
</style> 