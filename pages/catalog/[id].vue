<template>
  <div class="category container">
    <h2 class="category__title">{{ categoryName }}</h2>
    <p v-if="error" class="category__error">{{ error }}</p>
    <div v-else-if="loading" class="category__loading">
      Загрузка...
    </div>
    <div v-else-if="!products || products.length === 0" class="category__empty">
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
const categoryId = ref(Number(route.params.id))
const categoryName = ref('')
const products = ref<Product[] | null>(null)
const error = ref<string | null>(null)
const loading = ref(true)

async function loadCategory() {
  try {
    error.value = null
    loading.value = true
    products.value = null
    console.log('Loading category:', categoryId.value)
    const response = await $fetch<{ name: string, products: Product[] }>(`/api/categories/${categoryId.value}`)
    console.log('Received category data:', response)
    categoryName.value = response.name
    products.value = response.products
  } catch (e: any) {
    console.error('Ошибка загрузки категории:', e)
    error.value = e.statusMessage || 'Произошла ошибка при загрузке категории'
    products.value = []
  } finally {
    loading.value = false
  }
}

// Add watch for route changes
watch(() => route.params.id, (newId) => {
  if (newId) {
    categoryId.value = Number(newId)
    loadCategory()
  }
})

onMounted(loadCategory)
</script>

<style lang="scss" scoped>
.category {
  padding: 2rem 1rem;

  &__title {
    font-size: 2rem;
    margin-bottom: 2rem;
    text-align: center;
  }

  &__error {
    color: #dc3545;
    text-align: center;
    margin: 2rem 0;
  }

  &__loading {
    text-align: center;
    margin: 2rem 0;
    color: var(--text-secondary);
  }

  &__empty {
    text-align: center;
    margin: 2rem 0;
    color: var(--text-secondary);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 2rem;
  }

  &__card {
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

  &__img-wrapper {
    position: relative;
    padding-top: 75%;
    background: var(--bg-secondary);
  }

  &__card-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__card-name {
    font-size: 1.2rem;
    margin: 1rem;
    color: var(--text);
  }

  &__card-desc {
    margin: 0 1rem;
    color: var(--text-secondary);
    flex-grow: 1;
  }

  &__card-price {
    margin: 1rem;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--accent);
  }
}
</style> 