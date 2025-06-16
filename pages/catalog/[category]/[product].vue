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
                <span class="spec-dots"></span>
                <span class="spec-value">{{ value }}</span>
              </li>
            </ul>
          </div>
          <p class="product-price">{{ product.price.toLocaleString() }} &#8381;</p>
          <button class="btn btn-primary add-to-cart-btn" @click="addToCart">Добавить в корзину</button>
          
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
import { ref, computed, watch } from 'vue';
import { useCartStore } from '~/stores/cart';

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
  category_slug: string;
  slug: string;
  specs?: Record<string, any>;
}

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

// Get category and product slugs from route
const categorySlug = computed(() => {
  const slug = route.params.category
  return typeof slug === 'string' ? slug : Array.isArray(slug) ? slug[0] : ''
})

const productSlug = computed(() => {
  const slug = route.params.product
  return typeof slug === 'string' ? slug : Array.isArray(slug) ? slug[0] : ''
})

// Fetch products
const { data: fetchedProducts, error: fetchError } = await useFetch(`/api/products`, {
  query: computed(() => ({
    categorySlug: categorySlug.value
  })),
  transform: (response) => {
    console.log('API Response:', response)
    if (!response || typeof response !== 'object' || !('products' in response)) {
      console.error('Invalid response format:', response)
      return []
    }
    return response.products
  }
})

// Initialize products as an empty array
const products = ref<Product[]>([])

// Handle fetch errors
if (fetchError.value) {
  console.error('Error fetching products:', fetchError.value)
  products.value = []
} else if (fetchedProducts.value) {
  // Only map if we have valid data
  products.value = fetchedProducts.value.map(product => ({
    ...product,
    specs: {
      ...product.specs,
      power: product.specs?.power || 'отсутствует',
      fuel: Array.isArray(product.specs?.fuel) 
        ? product.specs.fuel 
        : typeof product.specs?.fuel === 'string' 
          ? product.specs.fuel.split(', ').map((f: string) => f.trim())
          : ['отсутствует']
    }
  }))
} else {
  products.value = []
}

// Get the current product
const currentProduct = computed(() => {
  if (!products.value || products.value.length === 0) {
    console.log('No products available')
    return null
  }
  
  console.log('Searching for product with slug:', productSlug.value)
  console.log('Available products:', products.value.map(p => ({
    name: p.name,
    slug: p.slug,
    id: p.id
  })))
  
  // Find product by matching slug or generated slug from name
  const foundProduct = products.value.find(p => {
    const generatedSlug = transliterate((p.name || '').toLowerCase())
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

    return p.slug === productSlug.value || generatedSlug === productSlug.value
  })
  
  if (!foundProduct) {
    console.error('Product not found:', {
      productSlug: productSlug.value,
      availableProducts: products.value.map(p => ({
        name: p.name,
        slug: p.slug
      }))
    })
  } else {
    console.log('Found product:', foundProduct)
  }

  return foundProduct || null
})

// Handle product not found
watch(currentProduct, (product) => {
  if (!product && products.value.length > 0) {
    console.log('Product not found, redirecting to category:', categorySlug.value)
    router.push(`/catalog/${categorySlug.value}`)
  }
}, { immediate: true })

// Use currentProduct in the template
const product = currentProduct

const capitalize = (s: string) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const cartStore = useCartStore();

const addToCart = () => {
  if (product.value) {
    cartStore.addItem({
      id: product.value.id,
      name: product.value.name,
      price: product.value.price,
      image: product.value.image,
      category: product.value.category,
      category_slug: product.value.category_slug,
      slug: product.value.slug,
      quantity: 1
    });
    alert('Товар добавлен в корзину');
  }
};
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
  align-items: center;
  margin-bottom: 8px;
}

.spec-label {
  white-space: nowrap;
}

.spec-dots {
  flex: 1;
  border-bottom: 1px dotted #999;
  padding-bottom: 10px;
  margin: 0 10px;
}

.spec-value {
  white-space: nowrap;
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
    padding: 14px;
  }
  .product-title {
    font-size: 1.3rem;
    margin-bottom: 10px;
  }
  .product-short-description {
    font-size: 13px;
    margin-bottom: 10px;
  }
  .product-specs {
    margin-bottom: 10px;
  }
  .specs-title {
    font-size: 1.1rem;
    margin-bottom: 8px;
  }
  .product-specs li {
    font-size: 13px;
    margin-bottom: 4px;
    padding-bottom: 2px;
  }
  .product-price {
    font-size: 1.2rem;
    margin-bottom: 12px;
  }
  .add-to-cart-btn {
    padding: 8px 14px;
    font-size: 1rem;
  }
  .product-detail-image {
    width: 100%;
    max-height: 180px;
    object-fit: contain;
  }
  .product-extended-description {
    margin-top: 16px;
    padding-top: 10px;
  }
  .extended-description-title {
    font-size: 1rem;
    margin-bottom: 8px;
  }
  .no-product-message {
    font-size: 1rem;
    padding: 20px 0;
  }
}
@media (max-width: 480px) {
  .product-detail-content {
    padding: 6px;
  }
  .product-title {
    font-size: 1.05rem;
  }
  .product-detail-image {
    max-height: 110px;
  }
  .add-to-cart-btn {
    padding: 6px 8px;
    font-size: 0.95rem;
  }
}

</style> 