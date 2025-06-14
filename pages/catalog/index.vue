<template>
  <div class="catalog-page">
    <div class="container">
      <h1 class="page-title">Каталог продукции</h1>
      
      <div class="catalog-grid">
        <div v-for="category in categories" :key="category.slug" class="catalog-item">
          <img :src="category.image" :alt="category.title" />
          <div class="catalog-item__content">
            <h2>{{ category.title }}</h2>
            <p>{{ category.description }}</p>
            <NuxtLink :to="`/catalog/${category.slug}`" class="btn btn-primary">Подробнее</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

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
  slug: string; // Add slug to Product interface
  specs: Record<string, any>;
}

interface Category {
  title: string;
  slug: string;
  image: string;
  description: string;
}

const { data: fetchedProducts, error: fetchError } = await useFetch<Product[]>('/api/products');

const products = ref<Product[]>([]);

if (fetchedProducts.value) {
  products.value = fetchedProducts.value.map(product => {
    const slug = transliterate(product.name).toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    return {
      ...product,
      slug: slug,
    };
  });
} else if (fetchError.value) {
  console.error('Error loading products:', fetchError.value);
}

const categories = computed<Category[]>(() => {
  const uniqueCategories = new Map<string, Category>();
  products.value.forEach(product => {
    if (!uniqueCategories.has(product.category)) {
      const slug = transliterate(product.category).toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
      uniqueCategories.set(product.category, {
        title: product.category,
        slug: slug,
        image: product.image, // Using product image as category image, needs to be refined if categories have specific images
        description: `Товары категории ${product.category}` // Generic description, can be improved
      });
    }
  });
  console.log('Generated categories:', Array.from(uniqueCategories.values())); // Log generated categories
  return Array.from(uniqueCategories.values());
});
</script>

<style scoped>
.catalog-page {
  padding: 40px 0;
}

.page-title {
  text-align: center;
  margin-bottom: 40px;
  font-size: 2.5rem;
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.catalog-item {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: visible;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  padding-top: 60px;
}

.catalog-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.catalog-item img {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 120px;
  object-fit: contain;
  z-index: 2;
}

.catalog-item__content {
  padding: 20px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.catalog-item h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.catalog-item p {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
}

@media (max-width: 1200px) {
  .catalog-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .catalog-grid {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 2rem;
  }
}
</style>
  