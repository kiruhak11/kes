<template>
  <div class="catalog container">
    <h2 class="catalog__title">Наш каталог котлов</h2>
    <div class="catalog__grid">
      <div v-for="item in products" :key="item.id" class="catalog__card card">
        <img
          :src="item.image || '/placeholder.jpg'"
          :alt="`Изображение ${item.name}`"
          class="catalog__card-img"
        />
        <h3 class="catalog__card-name">{{ item.name }}</h3>
        <p class="catalog__card-desc">{{ item.description }}</p>
        <p class="catalog__card-price">Цена: {{ item.price }} ₽</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
}

const products = ref<Product[]>([]);

async function loadProducts() {
  try {
    products.value = await $fetch<Product[]>("/api/products");
  } catch (e) {
    console.error("Ошибка загрузки каталога:", e);
  }
}

onMounted(loadProducts);
</script>

<style lang="scss" scoped>
.catalog {
  &__title {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: var(--text);
    text-align: center;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  &__card {
    /* Класс .card уже применяется в шаблоне, здесь лишь дополнительный стиль */
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;

    &-img {
      width: 100%;
      height: 180px;
      object-fit: cover;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
    }

    &-name {
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
      color: var(--text);
    }

    &-desc {
      font-size: 0.95rem;
      margin-bottom: 0.75rem;
      color: var(--secondary);
      text-align: center;
    }

    &-price {
      font-weight: 600;
      color: var(--accent);
      margin-top: auto;
    }

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
    }
  }
}
</style>
