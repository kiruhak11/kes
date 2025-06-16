<template>
  <div class="product-detail-page">
    <div class="container">
      <NuxtLink :to="`/catalog/${categorySlug}`" class="back-link">
        &larr; Назад к категории
      </NuxtLink>
      <div v-if="product" class="product-detail-card">
        <!-- Верхний блок: галерея + инфо -->
        <div class="product-top-row">
          <div class="product-gallery">
            <img :src="imageList[currentImageIndex]" :alt="product.name" class="main-image" />
            <div v-if="imageList.length > 1" class="thumb-strip">
              <img
                v-for="(src, idx) in imageList"
                :key="idx"
                :src="src"
                :alt="`thumb-${idx}`"
                :class="['thumb', { active: idx === currentImageIndex }]"
                @click="currentImageIndex = idx"
              />
            </div>
          </div>
          <div class="product-info-block">
            <h1 class="product-title">{{ product.name }}</h1>
            <p class="product-short-description">{{ product.description }}</p>
            <p class="product-price">{{ product.price.toLocaleString() }} &#8381;</p>
            <button class="btn btn-primary add-to-cart-btn" @click="addToCart">Добавить в корзину</button>
          </div>
        </div>
        <!-- Блок: описание и характеристики -->
        <div class="product-middle-row">
          <div class="product-extended-description">
            <h3 class="extended-description-title">Подробное описание:</h3>
            <p>{{ product.extendedDescription }}</p>
          </div>
          <div class="product-specs">
            <h3 class="specs-title">Характеристики:</h3>
            <ul>
              <li v-for="([key, value], idx) in displaySpecs" :key="key">
                <span class="spec-label">{{ capitalize(key) }}:</span>
                <span class="spec-dots"></span>
                <span class="spec-value">{{ Array.isArray(value) ? value.join(', ') : value }}</span>
              </li>
            </ul>
          </div>
        </div>
        <!-- Маркетинговый блок -->
        <div class="marketing-section">
          <div class="marketing-card">
            <h3>Специальное предложение!</h3>
            <p>Позвоните сейчас и получите скидку на этот товар!</p>
            <a href="tel:+79001234567" class="marketing-phone">+7 (900) 123-45-67</a>
          </div>
        </div>
        <!-- Похожие товары -->
        <div class="related-products-section">
          <h2 class="section-title">Вам также может понравиться</h2>
          <div class="related-products-grid">
            <div v-for="relatedProduct in relatedProducts" :key="relatedProduct.id" class="product-card">
              <img :src="relatedProduct.image" :alt="relatedProduct.name" />
              <div class="product-card__content">
                <h3>{{ relatedProduct.name }}</h3>
                <div class="related-category">{{ relatedProduct.category }}</div>
                <div class="related-price">{{ relatedProduct.price.toLocaleString() }} &#8381;</div>
              </div>
            </div>
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

const imageList = computed<string[]>(() => {
  if (!product.value) return []
  const specImages = (product.value as any).specs?.images
  const galleryArr = Array.isArray(specImages) ? specImages : []
  const list = [product.value.image, ...galleryArr]
  // remove duplicates
  return Array.from(new Set(list.filter(Boolean)))
})

const currentImageIndex = ref(0)

watch(product, () => {
  currentImageIndex.value = 0
})

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

const displaySpecs = computed(() => {
  if (!product.value || !product.value.specs) return []
  return Object.entries(product.value.specs).filter(([k]) => k !== 'images')
})

// Add related products logic
const relatedProducts = computed(() => {
  if (!products.value || products.value.length === 0) return []
  const otherProducts = products.value.filter(p => p.id !== product.value?.id)
  const shuffled = [...otherProducts].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, 3)
})
</script>

<style scoped>
.product-detail-page {
  padding: 40px 0;
  background: #fafbfc;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
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
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.07);
  padding: 32px 24px 24px 24px;
  margin-bottom: 32px;
}
.product-top-row {
  display: flex;
  gap: 40px;
  align-items: flex-start;
  margin-bottom: 32px;
}
.product-gallery {
  width: 320px;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.main-image {
  width: 100%;
  height: 320px;
  object-fit: contain;
  background: #f8f8f8;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.07);
  margin-bottom: 12px;
}
.thumb-strip {
  display: flex;
  gap: 8px;
  margin-top: 6px;
  overflow-x: auto;
}
.thumb {
  width: 60px;
  height: 48px;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 4px;
  flex-shrink: 0;
  transition: border-color 0.2s;
}
.thumb:hover {
  border-color: var(--secondary, #aaa);
}
.thumb.active {
  border-color: var(--primary, #007bff);
}
.product-info-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
  justify-content: flex-start;
}
.product-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 0;
  color: #222;
}
.product-short-description {
  color: #555;
  margin-bottom: 0;
  line-height: 1.5;
}
.product-price {
  font-size: 2rem;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 0;
}
.add-to-cart-btn {
  display: inline-block;
  padding: 14px 32px;
  background-color: #28a745;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
}
.add-to-cart-btn:hover {
  background-color: #218838;
}
.product-middle-row {
  display: flex;
  gap: 40px;
  margin-bottom: 32px;
}
.product-extended-description {
  flex: 2;
  background: #f7f7fa;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 0;
}
.extended-description-title {
  font-size: 1.3rem;
  margin-bottom: 10px;
  color: #333;
}
.product-specs {
  flex: 1;
  background: #f7f7fa;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 0;
}
.specs-title {
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: #333;
}
.product-specs ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.product-specs li {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 1rem;
}
.spec-label {
  white-space: nowrap;
  font-weight: 500;
}
.spec-dots {
  flex: 1;
  border-bottom: 1px dotted #bbb;
  margin: 0 8px;
  height: 1px;
}
.spec-value {
  white-space: nowrap;
}
.marketing-section {
  margin: 0 auto 32px auto;
  max-width: 600px;
}
.marketing-card {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: white;
  padding: 32px 24px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.13);
}
.marketing-card h3 {
  font-size: 1.6rem;
  margin-bottom: 10px;
}
.marketing-phone {
  display: inline-block;
  background: white;
  color: #ff6b6b;
  padding: 12px 25px;
  border-radius: 25px;
  text-decoration: none;
  font-weight: bold;
  margin-top: 15px;
  transition: transform 0.2s;
}
.marketing-phone:hover {
  transform: scale(1.05);
}
.related-products-section {
  margin: 48px auto 0 auto;
}
.section-title {
  font-size: 1.5rem;
  margin-bottom: 24px;
  text-align: center;
  color: #222;
}
.related-products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin-top: 24px;
}
.product-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  overflow: visible;
  transition: transform 0.25s, box-shadow 0.25s;
  position: relative;
  padding-top: 60px;
  min-height: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.product-card:hover {
  transform: translateY(-7px) scale(1.03);
  box-shadow: 0 8px 24px rgba(0,0,0,0.18);
}
.product-card img {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 120px;
  object-fit: contain;
  z-index: 2;
  border-radius: 8px;
  background: #f7f7fa;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.product-card__content {
  padding: 32px 16px 16px 16px;
  text-align: center;
  position: relative;
  z-index: 1;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.product-card h3 {
  font-size: 1.2rem;
  margin-bottom: 8px;
  font-weight: 700;
  color: #222;
}
.related-category {
  color: #888;
  font-size: 0.98rem;
  margin-bottom: 10px;
}
.related-price {
  color: #007bff;
  font-size: 1.15rem;
  font-weight: bold;
  margin-bottom: 0;
}
.no-product-message {
  text-align: center;
  font-size: 1.5rem;
  color: #999;
  padding: 50px 0;
}
@media (max-width: 1024px) {
  .product-top-row, .product-middle-row {
    flex-direction: column;
    gap: 24px;
  }
  .product-gallery {
    width: 100%;
    min-width: 0;
  }
  .related-products-grid {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 768px) {
  .product-detail-card {
    padding: 12px 4px;
  }
  .main-image {
    height: 180px;
  }
  .marketing-card {
    padding: 18px 6px;
  }
  .related-products-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 480px) {
  .product-title {
    font-size: 1.1rem;
  }
  .main-image {
    height: 110px;
  }
  .related-products-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 600px) {
  .product-card {
    min-height: 220px;
    padding-top: 40px;
  }
  .product-card img {
    width: 70px;
    height: 70px;
    top: -20px;
  }
  .product-card__content {
    padding: 16px 6px 8px 6px;
  }
}
</style> 