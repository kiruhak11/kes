<template>
  <div class="catalog container">
    <h2 class="catalog__title">Наш каталог котлов</h2>
    <div class="catalog__grid">
      <NuxtLink
        v-for="item in products"
        :key="item.id"
        :to="`/products/${item.id}`"
        class="catalog__card card"
      >
        <div class="catalog__img-wrapper">
          <img
            :src="item.image || '/placeholder.jpg'"
            :alt="item.name"
            class="catalog__card-img"
          />
        </div>
        <h3 class="catalog__card-name">{{ item.name }}</h3>
        <p class="catalog__card-desc">{{ item.description }}</p>
        <p class="catalog__card-price">Цена: {{ item.price }} ₽</p>
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
}

const products = ref<Product[]>([])

async function loadProducts() {
  try {
    products.value = await $fetch<Product[]>('/api/products')
  } catch (e) {
    console.error('Ошибка загрузки каталога:', e)
  }
}

onMounted(loadProducts)
</script>

<style lang="scss" scoped>
.catalog {
  &__title {
    font-size: 2rem;
    margin-top: 2rem;
    margin-bottom: 5rem;
    text-align: center;
    color: var(--text);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  &__card {
    position: relative;
    padding-top: 100px; /* место под нависающую картинку */
    overflow: visible;
    text-decoration: none;
    color: inherit;
    transition: transform .2s, box-shadow .2s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0,0,0,0.15);
    }
  }

  &__img-wrapper {
    position: absolute;
    top: -70px; /* половина высоты изображения */
    left: 50%;
    transform: translateX(-50%);
    width: 180px;
    height: 180px;
    overflow: visible;
    pointer-events: none;
  }

  &__card-img {
    width: 180px;
    height: 180px;
    object-fit: contain;
  }

  &__card-name {
    margin-top: 1rem;
    font-size: 1.2rem;
    color: var(--text);
    text-align: center;
  }

  &__card-desc {
    font-size: .95rem;
    color: var(--secondary);
    margin: .5rem 0;
    text-align: center;
  }

  &__card-price {
    font-weight: 600;
    color: var(--accent);
    text-align: center;
  }
}
</style>
