<template>
  <div class="category container">
    <h2 class="category__title">{{ categoryName }}</h2>
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
const categoryId = ref(Number(route.params.id))
const categoryName = ref('')
const products = ref<Product[]>([])
const error = ref<string | null>(null)

async function loadCategory() {
  try {
    error.value = null
    console.log('Loading category:', categoryId.value)
    const response = await $fetch<{ name: string, products: Product[] }>(`/api/categories/${categoryId.value}`)
    console.log('Received category data:', response)
    categoryName.value = response.name
    products.value = response.products
  } catch (e: any) {
    console.error('Ошибка загрузки категории:', e)
    error.value = e.statusMessage || 'Произошла ошибка при загрузке категории'
    products.value = []
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
// ... existing styles ...
</style> 