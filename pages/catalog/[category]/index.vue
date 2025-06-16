<template>
    <div class="category-page">
      <div class="container">
        <div class="category-header">
          <h1 class="page-title">{{ category?.title || 'Категория' }}</h1>
          <p class="category-description">{{ category?.description || '' }}</p>
        </div>
  
        <div class="category-content">
          <div class="category-sidebar">
            <div class="filter-section">
              <h3 @click="isMobile ? toggleFilters() : null" :class="{ 'filter-toggle': isMobile }">
                Фильтры
                <span v-if="isMobile" class="filter-arrow">{{ filtersOpen ? '▲' : '▼' }}</span>
              </h3>
              <div v-show="!isMobile || filtersOpen">
                <div class="filter-group">
                  <label>Мощность</label>
                  <div class="power-range-filter">
                    <input type="number" v-model.number="filters.minPower" placeholder="От" />
                    <input type="number" v-model.number="filters.maxPower" placeholder="До" />
                    <select v-model="filters.powerUnit">
                      <option value="">Ед. изм.</option>

                      <option v-for="unit in powerUnits" :key="unit" :value="unit">{{ unit }}</option>
                    </select>
                  </div>
                </div>
                <div class="filter-group">
                  <label>Топливо</label>
                  <select v-model="filters.fuel" multiple class="multi-select-fuel">
                    <option value="">Все</option>
                    <option value="отсутствует">Отсутствует</option>
                    <option v-for="fuel in uniqueFuels" :key="fuel" :value="fuel">{{ fuel }}</option>
                  </select>
                </div>
                <button class="btn btn-primary" @click="applyFilters">Применить</button>
              </div>
            </div>
          </div>
  
          <div class="category-products">
            <div class="products-grid">
              <div v-for="product in paginatedProducts" :key="product.id" class="product-card">
                <img :src="product.image" :alt="product.name" />
                <div class="product-card__content">
                  <h3>{{ product.name }}</h3>
                  <p>{{ product.description }}</p>
                  <div class="product-card__specs">
                    <div class="spec-item">
                      <span class="spec-label">Мощность:</span>
                      <span class="spec-dots"></span>
                      <span class="spec-value">{{ product.specs?.power }}</span>
                    </div>
                    <div class="spec-item">
                      <span class="spec-label">Топливо:</span>
                      <span class="spec-dots"></span>
                      <span class="spec-value">{{ Array.isArray(product.specs?.fuel) && product.specs.fuel.length > 0 && product.specs.fuel[0] !== 'отсутствует' ? product.specs.fuel.join(', ') : 'Отсутствует' }}</span>
                    </div>
                    <div class="spec-item">
                      <span class="spec-label">Цена:</span>
                      <span class="spec-dots"></span>
                      <span class="spec-value">{{ product.price.toLocaleString() }} &#8381;</span>
                    </div>
                  </div>
                  <NuxtLink 
                    :to="`/catalog/${generateCategorySlug(product.category || '')}/${generateProductSlug(product)}`"
                    class="btn btn-primary"
                  >
                    Подробнее
                  </NuxtLink>
                </div>
              </div>
              <div v-if="filteredProducts.length === 0" class="no-products-message">
                Нет товаров в данной категории.
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="pagination" v-if="totalPages > 1">
        <button 
          class="btn btn-secondary" 
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          Назад
        </button>
        <span class="page-info">Страница {{ currentPage }} из {{ totalPages }}</span>
        <button 
          class="btn btn-secondary" 
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          Вперед
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue'
  
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
    id: number
    name: string
    description: string
    extendedDescription: string
    price: number
    image: string
    category: string
    slug: string
    specs: {
      power?: string;
      fuel?: string[];
      [key: string]: any;
    }
  }
  
  interface CategoryInfo {
    title: string
    description: string
    slug: string
  }
  
  const route = useRoute()
  const router = useRouter()
  const config = useRuntimeConfig()

  // Pagination state
  const currentPage = ref(1)
  const itemsPerPage = 10

  // Products state
  const allProducts = ref<Product[]>([])

  // Fetch products
  const { data: fetchedAllProducts, error: fetchError } = await useFetch(`/api/products`, {
    query: {
      categorySlug: route.params.category,
      page: currentPage.value,
      limit: itemsPerPage
    },
    transform: (response) => {
      console.log('API Response:', response)
      if (!response || !response.products) {
        console.error('Invalid response format:', response)
        return []
      }
      return response.products
    }
  })

  // Handle fetch errors
  if (fetchError.value) {
    console.error('Error fetching products:', fetchError.value)
    allProducts.value = []
  } else if (fetchedAllProducts.value) {
    console.log('Fetched products:', fetchedAllProducts.value)
    // Only map if we have valid data
    allProducts.value = fetchedAllProducts.value.map(product => ({
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
    console.log('No products fetched')
    allProducts.value = []
  }

  const categorySlug = ref(route.params.category as string)
  
  // console.log('Category Slug:', categorySlug)
  
  watch(() => route.params.category, (newCategorySlug) => {
    categorySlug.value = newCategorySlug as string;
    // No need to reload all products, just re-filter
  });
  
  const category = computed<CategoryInfo | undefined>(() => {
    const foundProduct = allProducts.value.find(p => transliterate(p.category).toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-') === categorySlug.value)
    if (foundProduct) {
      return {
        title: foundProduct.category,
        description: `Товары категории ${foundProduct.category}`,
        slug: categorySlug.value
      }
    }
    return undefined
  })
  
  const productsInCategory = computed<Product[]>(() => {
    return allProducts.value.filter(product => 
      transliterate(product.category).toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-') === categorySlug.value
    )
  })
  
  // console.log('Products in Category:', productsInCategory.value)
  
  const filters = ref({
    minPower: undefined as number | undefined,
    maxPower: undefined as number | undefined,
    powerUnit: '',
    fuel: [] as string[],
  })

  const powerUnits = computed(() => {
    const units = new Set<string>();
    productsInCategory.value.forEach(product => {
      const powerMatch = product.specs?.power?.match(/^(\d+(\.\d+)?)\s*(.*)$/);
      if (powerMatch && powerMatch[3]) {
        units.add(powerMatch[3]);
      }
    });
    return Array.from(units).sort();
  });

  const uniqueFuels = computed(() => {
    const fuels = new Set<string>();
    productsInCategory.value.forEach(product => {
      if (product.specs?.fuel) {
        const productFuels = Array.isArray(product.specs.fuel) ? product.specs.fuel : String(product.specs.fuel).split(', ').map(f => f.trim());
        productFuels.forEach(fuel => {
          if (fuel && fuel !== 'отсутствует') {
            fuels.add(fuel);
          }
        });
      }
    });
    return Array.from(fuels).sort();
  });

  const filteredProducts = computed(() => {
    let result = productsInCategory.value

    // Применяем фильтры только если они установлены
    if (filters.value.minPower || filters.value.maxPower || filters.value.powerUnit || filters.value.fuel.length > 0) {
      result = result.filter(product => {
        const productPower = product.specs?.power || 'отсутствует'
        const productFuels = Array.isArray(product.specs?.fuel) ? product.specs.fuel : []

        // Фильтрация по мощности
        if (filters.value.minPower || filters.value.maxPower || filters.value.powerUnit) {
          if (productPower === 'отсутствует') return false

          const powerMatch = productPower.match(/^(\d+(\.\d+)?)\s*(.*)$/)
          if (!powerMatch) return false

          const powerValue = parseFloat(powerMatch[1])
          const powerUnit = powerMatch[3]

          if (filters.value.powerUnit && filters.value.powerUnit !== powerUnit) return false
          if (filters.value.minPower && powerValue < filters.value.minPower) return false
          if (filters.value.maxPower && powerValue > filters.value.maxPower) return false
        }

        // Фильтрация по топливу
        if (filters.value.fuel.length > 0) {
          if (!productFuels.some(fuel => filters.value.fuel.includes(fuel))) return false
        }

        return true
      })
    }

    return result
  })
  
  // Добавляем состояние для пагинации
  const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredProducts.value.slice(start, end)
  })

  const totalPages = computed(() => {
    return Math.ceil(filteredProducts.value.length / itemsPerPage)
  })

  // Добавляем методы для пагинации
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function applyFilters() {
    // Filters are reactive, no need for explicit apply logic here beyond just triggering re-computation.
    // This function can be used for any additional side effects if needed in the future.
  }

  const isMobile = ref(false)
  onMounted(() => {
    isMobile.value = window.innerWidth <= 768
    window.addEventListener('resize', () => {
      isMobile.value = window.innerWidth <= 768
    })
  })

  const filtersOpen = ref(!isMobile.value)
  watch(isMobile, (val) => {
    filtersOpen.value = !val
  })
  function toggleFilters() {
    filtersOpen.value = !filtersOpen.value
  }

  const generateProductSlug = (product: Product) => {
    const slug = transliterate(product.name || '').toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
    console.log('Generated product slug:', {
      name: product.name,
      slug: slug
    })
    return slug
  }

  const generateCategorySlug = (category: string) => {
    const slug = transliterate(category).toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
    console.log('Generated category slug:', {
      category: category,
      slug: slug
    })
    return slug
  }
  </script>
  
  <style scoped>
  .category-page {
    padding: 40px 0;
  }
  
  .page-title {
    text-align: center;
    margin-bottom: 20px;
    font-size: 2.5rem;
  }
  
  .category-description {
    text-align: center;
    color: #666;
    max-width: 800px;
    margin: 0 auto 40px;
    line-height: 1.6;
  }
  
  .category-content {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 40px;
  }
  
  .category-sidebar {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 20px;
    overflow: hidden;
  }
  
  .filter-section h3 {
    margin-bottom: 20px;
    font-size: 1.25rem;
  }
  .spec-dots {
  flex: 1;
  border-bottom: 1px dotted #999;
  
  margin: 0 10px;
}
  .filter-group {
    margin-bottom: 20px;
  }
  
  .filter-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  .power-range-filter {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }
  
  .power-range-filter input[type="number"] {
    flex: 1 1 calc(50% - 10px);
    min-width: 0;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    box-sizing: border-box;
  }
  
  .power-range-filter select {
    flex-shrink: 0;
    width: 80px;
    min-width: 60px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    box-sizing: border-box;
  }
  
  .filter-group select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
  }

  .multi-select-fuel {
    height: auto;
    min-height: 100px;
    padding: 10px;
  }
  
  .products-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
  }
  
  .product-card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: visible;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
    padding-top: 60px;
  }
  
  .product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
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
  }
  
  .product-card__content {
    padding: 20px;
    text-align: center;
    position: relative;
    z-index: 1;
  }
  
  .product-card h3 {
    font-size: 1.5rem;
    margin-bottom: 10px;
  }
  
  .product-card p {
    color: #666;
    margin-bottom: 20px;
    line-height: 1.6;
  }
  
  .product-card__specs {
    margin-bottom: 20px;
  }
  
  .spec-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  
  .spec-label {
    color: #666;
  }
  
  .spec-value {
    font-weight: 500;
  }
  
  @media (max-width: 1200px) {
    .category-content {
      grid-template-columns: 250px 1fr;
    }
  }
  
  @media (max-width: 992px) {
    .category-content {
      grid-template-columns: 1fr;
    }
    
    .category-sidebar {
      margin-bottom: 30px;
    }
  }
  
  @media (max-width: 768px) {
    .category-page {
      padding: 20px 0;
    }
    .category-header {
      margin-bottom: 10px;
    }
    .category-content {
      gap: 16px;
    }
    .category-sidebar {
      padding: 10px;
      font-size: 14px;
    }
    .filter-section h3 {
      font-size: 1.1rem;
      margin-bottom: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .filter-toggle {
      user-select: none;
    }
    .filter-arrow {
      font-size: 1.2em;
      margin-left: 8px;
    }
    .filter-group {
      margin-bottom: 10px;
    }
    .power-range-filter input[type="number"],
    .power-range-filter select,
    .filter-group select {
      padding: 6px;
      font-size: 13px;
    }
    .multi-select-fuel {
      min-height: 60px;
      padding: 6px;
      font-size: 13px;
    }
    .products-grid {
      gap: 14px;
    }
    .product-card {
      padding-top: 30px;
    }
    .product-card img {
      width: 70px;
      height: 70px;
      top: -20px;
    }
    .product-card__content {
      padding: 10px;
    }
    .product-card h3 {
      font-size: 1.1rem;
      margin-bottom: 6px;
    }
    .product-card p {
      font-size: 13px;
      margin-bottom: 10px;
    }
    .product-card__specs {
      margin-bottom: 10px;
      font-size: 13px;
    }
    .spec-item {
      margin-bottom: 4px;
    }
    .no-products-message {
      font-size: 1rem;
      padding: 10px;
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
  }

  .page-info {
    font-size: 1rem;
    color: #666;
  }

  .btn-secondary {
    background-color: #f0f0f0;
    color: #333;
    border: 1px solid #ddd;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
  }

  .btn-secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  </style> 