<template>
  <section class="product-page container" v-if="product">
    <div class="breadcrumbs">
      <NuxtLink to="/catalog">← Назад в каталог</NuxtLink>
    </div>

    <div class="product-detail">
      <img
        :src="product.image || '/placeholder.jpg'"
        :alt="product.name"
        class="product-img"
      />
      <div class="product-info">
        <h1 class="product-title">{{ product.name }}</h1>
        <p class="product-price">Цена: {{ product.price }} ₽</p>
        <p class="product-desc">{{ product.description }}</p>

        <h3>Характеристики</h3>
        <ul class="product-specs">
          <li v-for="(value, key) in product.specs" :key="key">
            <strong>{{ key }}:</strong> {{ value }}
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  specs?: Record<string, string>;
}

const route = useRoute();
const router = useRouter();
const product = ref<Product | null>(null);

async function load() {
  try {
    const id = Number(route.params.id);
    if (!id) return router.replace("/catalog");
    product.value = await $fetch<Product>(`/api/products/${id}`);
  } catch {
    router.replace("/catalog");
  }
}

onMounted(load);
</script>

<style lang="scss" scoped>
.product-page {
  padding: 4rem 0;

  .breadcrumbs {
    margin-bottom: 1rem;
  }

  .product-detail {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;

    .product-img {
      flex: 1 1 320px;
      max-width: 480px;
      border-radius: 0.5rem;
      object-fit: cover;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }

    .product-info {
      flex: 1 1 320px;

      .product-title {
        font-size: 2rem;
        margin-bottom: 0.5rem;
      }
      .product-price {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: var(--accent);
      }
      .product-desc {
        margin-bottom: 1.5rem;
      }
      .product-specs {
        list-style: none;
        padding: 0;
        li {
          margin-bottom: 0.5rem;
          strong {
            width: 140px;
            display: inline-block;
          }
        }
      }
    }
  }
}
</style>
