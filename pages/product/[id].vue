<template>
    <section class="product-page container" v-if="product">
      <div class="breadcrumbs">
        <button @click="$router.back()">← Назад</button>
      </div>
  
      <div class="product-detail">
        <img
          :src="product.image || '/placeholder.jpg'"
          :alt="`Изображение ${product.name}`"
          class="product-detail__img"
        />
        <div class="product-detail__info">
          <h1 class="product-detail__title">{{ product.name }}</h1>
          <p class="product-detail__price">Цена: {{ product.price }} ₽</p>
          <p class="product-detail__desc">{{ product.description }}</p>
  
          <div
            v-if="product.specs && Object.keys(product.specs).length"
            class="product-detail__specs"
          >
            <h2>Характеристики</h2>
            <ul>
              <li v-for="(value, key) in product.specs" :key="key">
                <strong>{{ key }}:</strong> {{ value }}
              </li>
            </ul>
          </div>
          <div
            v-if="product.extendedDescription"
            class="product-detail__full-desc"
          >
            <h2>Подробное описание:</h2>
            <div class="product-detail__full-desc-content">
              {{ product.extendedDescription }}
            </div>
          </div>
        </div>
      </div>
    </section>
  
    <p v-else class="product-page__not-found">
      Товар не найден или произошла ошибка загрузки.
    </p>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  
  interface Product {
    id: number
    name: string
    description: string
    extendedDescription: string
    price: number
    image?: string
    specs?: Record<string,string>
  }
  
  const route  = useRoute()
  const router = useRouter()
  const product = ref<Product|null>(null)
  
  onMounted(async () => {
    const id = Number(route.params.id)
    if (!id || Number.isNaN(id)) {
      return router.replace('/catalog')
    }
    try {
      product.value = await $fetch<Product>(`/api/products/${id}`)
    } catch (e) {
      console.error('Error loading product:', e)
      product.value = null
    }
  })
  </script>
  
  <style lang="scss" scoped>
  .product-page {
    padding: 4rem 0;
  
    &__not-found {
      text-align: center;
      font-size: 1.25rem;
      color: var(--secondary);
    }
  
    .breadcrumbs {
      margin-bottom: 1rem;
    }
  
    .product-detail {
      display: flex;
      flex-wrap: wrap;
      gap: 2rem;
  
      &__img {
        flex: 1 1 320px;
        max-width: 480px;
        border-radius: .5rem;
        object-fit: cover;
        box-shadow: 0 8px 24px rgba(0,0,0,0.1);
      }
  
      &__info {
        flex: 1 1 320px;
      }
  
      &__title {
        font-size: 2rem;
        margin-bottom: .5rem;
      }
  
      &__price {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: var(--accent);
      }
  
      &__desc {
        margin-bottom: 1.5rem;
        line-height: 1.6;
      }
  
      &__specs {
        h2 {
          font-size: 1.5rem;
          margin-bottom: .5rem;
        }
        ul {
          list-style: none;
          padding: 0;
        }
        li {
          margin-bottom: .5rem;
          strong {
            display: inline-block;
            width: 140px;
          }
        }
      }
    }
  }
  </style>