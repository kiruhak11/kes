<template>
  <div class="product-detail-page">
    <div class="container">
      <NuxtLink :to="`/catalog/${categorySlug}`" class="back-link">
        &larr; Назад к категории
      </NuxtLink>
      <div v-if="product" class="product-detail-card">
        <img :src="product.image" :alt="product.name" class="product-detail-image" />
        <div class="product-detail-content">
          <h1 class="product-title">{{ product.name }}</h1>
          <p class="product-short-description">{{ product.description }}</p>
          <div class="product-specs">
            <h3 class="specs-title">Характеристики:</h3>
            <ul>
              <li v-for="(value, key) in product.specs" :key="key">
                <span class="spec-label">{{ capitalize(key) }}:</span>
                <span class="spec-value">{{ value }}</span>
              </li>
            </ul>
          </div>
          <p class="product-price">{{ product.price.toLocaleString() }} &#8381;</p>
          <button class="btn btn-primary add-to-cart-btn">Добавить в корзину</button>
          
          <div class="product-extended-description">
            <h3 class="extended-description-title">Подробное описание:</h3>
            <p>{{ product.extendedDescription }}</p>
          </div>
        </div>
      </div>
      <div v-else class="no-product-message">
        Товар не найден.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import productsData from '~/data/products.json';

const transliterate = (text: string): string => {
  const mapping: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z',
    'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
    'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh',
    'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh', 'З': 'Z',
    'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R',
    'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh',
    'Щ': 'Sch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
  };
  return text.split('').map(char => mapping[char] || char).join('');
};

interface Product {
  id: number;
  name: string;
  description: string;
  extendedDescription: string;
  price: number;
  image: string;
  category: string;
  slug: string;
  specs?: Record<string, any>;
}

const route = useRoute();
const categorySlug = route.params.category as string;
const productSlug = route.params.product as string;

console.log('Debug - Category Slug:', categorySlug);
console.log('Debug - Product Slug:', productSlug);

const allProducts = ref<Product[]>(productsData.map(product => ({
  ...product,
  slug: transliterate(product.name).toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'),
})));

const product = computed<Product | undefined>(() => {
  return allProducts.value.find(p => 
    transliterate(p.category).toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-') === categorySlug &&
    transliterate(p.name).toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-') === productSlug
  );
});

console.log('Debug - Found Product:', product.value);

const capitalize = (s: string) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}
</script>

<style scoped>
.product-detail-page {
  padding: 40px 0;
}

.back-link {
  display: inline-block;
  margin-bottom: 20px;
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.back-link:hover {
  text-decoration: underline;
}

.product-detail-card {
  display: flex;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.product-detail-image {
  width: 50%;
  height: auto;
  object-fit: cover;
}

.product-detail-content {
  padding: 30px;
  width: 50%;
}

.product-title {
  font-size: 2.5rem;
  margin-bottom: 15px;
  color: #333;
}

.product-short-description {
  color: #555;
  margin-bottom: 20px;
  line-height: 1.6;
}

.product-specs {
  margin-bottom: 20px;
}

.specs-title {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #333;
}

.product-specs ul {
  list-style: none;
  padding: 0;
}

.product-specs li {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  border-bottom: 1px dashed #eee;
  padding-bottom: 5px;
}

.spec-label {
  font-weight: 500;
  color: #666;
}

.spec-value {
  color: #333;
}

.product-price {
  font-size: 2rem;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 25px;
}

.add-to-cart-btn {
  display: inline-block;
  padding: 12px 25px;
  background-color: #28a745;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-to-cart-btn:hover {
  background-color: #218838;
}

.product-extended-description {
  margin-top: 30px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.extended-description-title {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #333;
}

.no-product-message {
  text-align: center;
  font-size: 1.5rem;
  color: #999;
  padding: 50px 0;
}

@media (max-width: 1024px) {
  .product-detail-card {
    flex-direction: column;
  }

  .product-detail-image,
  .product-detail-content {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .product-detail-content {
    padding: 20px;
  }

  .product-title {
    font-size: 2rem;
  }

  .product-price {
    font-size: 1.8rem;
  }
}

</style> 