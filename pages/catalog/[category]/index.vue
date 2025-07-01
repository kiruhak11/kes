<template>
    <div class="category-page">
      <div class="container">
        <nav class="breadcrumbs" v-scroll-reveal="'fade-in'">
          <NuxtLink to="/">Главная</NuxtLink>
          <span class="breadcrumbs-separator">→</span>
          <NuxtLink to="/catalog">Каталог</NuxtLink>
          <span class="breadcrumbs-separator">→</span>
          <span>{{ categoryInfo?.title || 'Категория' }}</span>
        </nav>
        <div class="category-header" v-scroll-reveal="'fade-in-up'">
          <h1 class="page-title">{{ categoryInfo?.title || 'Категория' }}</h1>
          <p class="category-description">{{ categoryInfo?.description || '' }}</p>
        </div>
  
        <div class="category-content">
          <div class="category-sidebar" v-scroll-reveal="'slide-in-left'">
            <div class="filter-section" @click="toggleFiltersCollapsed" style="cursor:pointer; user-select:none;">
              <h3 class="filter-section__title">
                Фильтры
                <span class="filter-section__arrow" :style="{ transform: filtersCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }">
                  <IconsArrowDown/>
                </span>
              </h3>
            </div>
            <transition name="filters-slide">
              <div v-show="!filtersCollapsed" class="filters-content">
                <div class="filter-group price-range">
                  <div class="filter-header" @click="togglePriceFilter">
                    <span>Цена</span>
                    <span class="filter-arrow" :class="{ open: priceFilterOpen }">
                      <IconsArrowDown/>
                    </span>
                  </div>
                  <div v-show="priceFilterOpen" class="filter-body">
                    <div class="price-inputs">
                      <input type="number" v-model="priceRange.min" placeholder="От" />
                      <span>-</span>
                      <input type="number" v-model="priceRange.max" placeholder="До" />
                    </div>
                  </div>
                </div>
                <div v-for="spec in filteredSpecs" :key="spec" class="filter-group">
                  <div class="filter-header" @click="toggleSpecFilter(spec)">
                    <span>{{ spec }}</span>
                    <span class="filter-arrow" :class="{ open: openFilters[spec] }">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.5 7.5L9 12L13.5 7.5" stroke="#e31e24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </span>
                  </div>
                  <div v-show="openFilters[spec]" class="filter-body">
                    <template v-if="specOptions[spec] && specOptions[spec].length > 0">
                      <select v-if="specOptions[spec].length <= 10" v-model="dynamicFilters[spec]" class="filter-select">
                        <option value="" disabled>Выберите фильтр</option>
                        <option v-for="option in specOptions[spec]" :key="option" :value="option">{{ option }}</option>
                      </select>
                      <input v-else type="text" v-model="dynamicFilters[spec]" placeholder="Введите значение" />
                    </template>
                    <button v-if="dynamicFilters[spec]" class="clear-filter" @click="clearFilter(spec)">Сбросить</button>
                  </div>
                </div>
                <div class="filter-actions">
                  <button class="btn btn-primary" @click="applyFilters" v-scroll-reveal="'zoom-in'">Применить</button>
                  <button class="btn btn-secondary" @click="resetFilters" v-scroll-reveal="'zoom-in'">Сбросить все</button>
                </div>
              </div>
            </transition>
          </div>
  
          <div class="category-products" v-scroll-reveal="'fade-in-up'">
            <div class="products-grid">
              <div
                v-for="(product, index) in paginatedProducts"
                :key="product.id"
                class="product-card"
                v-scroll-reveal="index % 2 === 0 ? 'slide-in-left' : 'slide-in-right'"
              >
                <div class="product-card__clickable" @click="router.push(`/catalog/${product.category_slug}/${generateProductSlug(product)}`)">
                  <div class="product-card__img-wrap">
                    <NuxtImg
                      :placeholder="true"
                      sizes="400px xxs:900px md:1200px"
                      format="webp"
                      :src="product.image ?? undefined"
                      :alt="product.name ?? undefined"
                      class="product-image" />
                  </div>
                  <div class="product-card__content">
                    <div class="product-card__title-row">
                      <h3 class="product-title">{{ product.name }}</h3>
                      <span class="product-title-icon"><!-- иконка, если нужна --></span>
                    </div>
                    <div class="product-card__specs">
                      <div v-for="spec in (product.specs || []).slice(0, 4)" :key="spec.id" class="spec-item">
                        <span class="spec-label">{{ typeof spec === 'object' ? spec.key : 'Invalid spec' }}</span>
                        <span class="spec-dots"></span>
                        <span class="spec-value">{{ typeof spec === 'object' ? spec.value : JSON.stringify(spec) }}</span>
                      </div>
                    </div>
                    <div class="product-card__bottom">
                      <div class="product-card__price-block">
                        <span class="product-price">{{ product.price?.toLocaleString() }} <span class="currency">р.</span></span>
                        <span class="product-price-note">Цена с НДС</span>
                      </div>
                      <button class="buy-btn" @click.stop="addToCart(product, $event)" v-scroll-reveal="'zoom-in'">
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M6 6h15l-1.5 9h-13z" stroke="#e31e24" stroke-width="2"/><circle cx="9" cy="20" r="1" fill="#e31e24"/><circle cx="18" cy="20" r="1" fill="#e31e24"/></svg>
                        <span>Купить</span>
                      </button>
                    </div>
                  </div>
                </div>
                <button class="offer-btn" @click="openCommercialOfferModal(product)" v-scroll-reveal="'zoom-in'">Заказать коммерческое предложение</button>
              </div>
              <div v-if="filteredProducts.length === 0" class="no-products-message" v-scroll-reveal="'fade-in-up'">
                Нет товаров в данной категории.
              </div>
            </div>
            <div class="products-count" v-if="filteredProducts.length > 0" v-scroll-reveal="'fade-in-up'">
              Найдено товаров: {{ filteredProducts.length }}
            </div>
          </div>
        </div>
      </div>
      <div class="pagination" v-if="totalPages > 1" v-scroll-reveal="'fade-in-up'">
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
    <CommercialOfferModal
    v-if="showCommercialOfferModal && selectedProduct"
    :is-open="showCommercialOfferModal"
    :product="selectedProduct"
    @close="closeCommercialOfferModal"
  />
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue'
  import { useCartStore } from '~/stores/cart'
  import { useRoute, useRouter } from 'vue-router'
  import CommercialOfferModal from '~/components/CommercialOfferModal.vue'
  import type { Characteristic } from '~/types/product'


const showCommercialOfferModal = ref(false)
const selectedProduct = ref<Product | null>(null)

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/images/placeholders/product-placeholder.png'
}

const openCommercialOfferModal = (product: Product) => {
  selectedProduct.value = product
  showCommercialOfferModal.value = true
}

const closeCommercialOfferModal = () => {
  showCommercialOfferModal.value = false
  selectedProduct.value = null
}
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
    name: string | null
    description: string | null
    extendedDescription?: string | null
    price: number | null
    image: string | null
    category_id: string | null
    category_name?: string
    category_slug?: string
    category?: string
    slug?: string
    specs?: Characteristic[]
    additional_images?: string[] | null
    images?: string[]
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
    
    allProducts.value = fetchedAllProducts.value
  } else { 
    allProducts.value = []
  }

  const categorySlug = ref(route.params.category as string)
   
  
  watch(() => route.params.category, (newCategorySlug) => {
    categorySlug.value = newCategorySlug as string;
    // No need to reload all products, just re-filter
  });
  
  const categoryInfo = ref<CategoryInfo | undefined>(undefined)
  const sliderImages = ref<string[]>([])
  const sliderIndex = ref(0)

  // Обновляем слайдер при изменении продуктов
  watch(() => allProducts.value, (newProducts) => {
    // Собираем картинки из товаров
    sliderImages.value = newProducts
      .filter(product => product.image !== null)
      .map(product => product.image as string)

    if (sliderImages.value.length === 0) {
      sliderImages.value = ['/images/placeholders/category-placeholder.png']
    }
  }, { immediate: true })

  function prevSlide() {
    sliderIndex.value = (sliderIndex.value - 1 + sliderImages.value.length) % sliderImages.value.length
  }
  function nextSlide() {
    sliderIndex.value = (sliderIndex.value + 1) % sliderImages.value.length
  }
  
  const productsInCategory = computed<Product[]>(() => {
    return allProducts.value.filter(product => {
      if (!product.category_name) return false;
      const productCategorySlug = transliterate(product.category_name)
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      return productCategorySlug === categorySlug.value;
    });
  })
   
  
  const filters = ref({
    minPower: undefined as number | undefined,
    maxPower: undefined as number | undefined,
    powerUnit: '',
    fuel: [] as string[],
  })

  const powerUnits = computed(() => {
    const units = new Set<string>()
    productsInCategory.value.forEach(product => {
      if (product.specs && Array.isArray(product.specs)) {
        const powerSpec = product.specs.find(spec => spec.key === 'power')
        if (powerSpec && powerSpec.value && powerSpec.value !== 'отсутствует') {
          const match = powerSpec.value.match(/^(\d+(\.\d+)?)\s*(.*)$/)
          if (match) {
            units.add(match[3])
          }
        }
      }
    })
    return Array.from(units)
  })

  const uniqueFuels = computed(() => {
    const fuels = new Set<string>()
    productsInCategory.value.forEach(product => {
      if (product.specs && Array.isArray(product.specs)) {
        const fuelSpec = product.specs.find(spec => spec.key === 'fuel')
        if (fuelSpec && fuelSpec.value) {
          if (Array.isArray(fuelSpec.value)) {
            fuelSpec.value.forEach((f: string) => fuels.add(f))
          } else {
            fuels.add(fuelSpec.value)
          }
        }
      }
    })
    return Array.from(fuels)
  })

  // 1. Собираем все уникальные характеристики из specs
  const uniqueSpecs = computed<string[]>(() => {
    const specsSet = new Set<string>()
    productsInCategory.value.forEach(product => {
      if (product.specs && Array.isArray(product.specs)) {
        product.specs.forEach(spec => {
          if (spec.key) specsSet.add(spec.key)
        })
      }
    })
    return Array.from(specsSet)
  })

  // 2. Собираем возможные значения для каждой характеристики
  const specOptions = computed(() => {
    const options: Record<string, Set<any>> = {}
    productsInCategory.value.forEach(product => {
      if (product.specs && Array.isArray(product.specs)) {
        product.specs.forEach(spec => {
          if (spec.key && spec.value) {
            if (!options[spec.key]) options[spec.key] = new Set()
            options[spec.key].add(spec.value)
          }
        })
      }
    })
    // Преобразуем Set в массивы
    return Object.fromEntries(Object.entries(options).map(([k, v]) => [k, Array.from(v)]))
  })

  // 3. Состояние фильтров по характеристикам
  const dynamicFilters = ref<Record<string, any>>({})

  const priceRange = ref({
    min: undefined as number | undefined,
    max: undefined as number | undefined
  })

  // Update the filteredProducts computed property
  const filteredProducts = computed(() => {
    return productsInCategory.value.filter(product => {
      // Price range filter
      if (priceRange.value.min !== undefined && product.price && product.price < priceRange.value.min) {
        return false
      }
      if (priceRange.value.max !== undefined && product.price && product.price > priceRange.value.max) {
        return false
      }

      // Dynamic filters
      for (const key of uniqueSpecs.value) {
        const filterValue = dynamicFilters.value[key]
        if (filterValue === undefined || filterValue === '' || (Array.isArray(filterValue) && filterValue.length === 0)) continue
        
        // Находим значение характеристики в новом формате
        const specItem = product.specs?.find(spec => spec.key === key)
        const productValue = specItem?.value
        
        if (Array.isArray(filterValue)) {
          if (!Array.isArray(productValue) || !filterValue.some(v => productValue.includes(v))) {
            return false
          }
        } else {
          if (Array.isArray(productValue)) {
            if (!productValue.includes(filterValue)) {
              return false
            }
          } else {
            if (productValue != filterValue) {
              return false
            }
          }
        }
      }
      return true
    })
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

  function resetFilters() {
    dynamicFilters.value = {}
    priceRange.value = {
      min: undefined,
      max: undefined
    }
    // Закрываем все дропдауны
    Object.keys(openFilters.value).forEach(key => {
      openFilters.value[key] = false
    })
    priceFilterOpen.value = false
  }

  const isMobile = ref(false)
  onMounted(() => {
    isMobile.value = window.innerWidth <= 768
    window.addEventListener('resize', () => {
      isMobile.value = window.innerWidth <= 768
    })
  })

  const openFilters = ref<Record<string, boolean>>({})
  const priceFilterOpen = ref(false)

  function toggleSpecFilter(spec: string) {
    openFilters.value[spec] = !openFilters.value[spec]
  }

  function togglePriceFilter() {
    priceFilterOpen.value = !priceFilterOpen.value
  }

  function clearFilter(spec: string) {
    dynamicFilters.value[spec] = ''
  }

  const generateProductSlug = (product: Product) => {
    if (!product || !product.name) return '';
    return transliterate(product.name)
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  const generateCategorySlug = (category: string) => {
    const slug = transliterate(category).toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-') 
    return slug
  }

  const cartStore = useCartStore()

  function addToCart(product: Product, e: Event) {
    e.stopPropagation();
    if (!product.name || !product.price || !product.image) {
      console.error('Invalid product data:', product);
      return;
    }
    // @ts-ignore
    cartStore.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category_name || 'Без категории',
      category_slug: product.category_slug || generateCategorySlug(product.category_name || 'Без категории'),
      slug: product.slug || generateProductSlug(product),
      quantity: 1
    });
  }

  // Получаем инфу о категории
  const { data: fetchedCategory, error: categoryError } = await useFetch(`/api/categories/${categorySlug.value}`)
  if ((fetchedCategory.value as any) && (fetchedCategory.value as any).category) {
    categoryInfo.value = {
      title: (fetchedCategory.value as any).category.name || '',
      description: (fetchedCategory.value as any).category.description || '',
      slug: categorySlug.value
    }
  } else {
    console.error('Failed to fetch category info:', categoryError.value)
  }

  // Инициализируем все фильтры пустыми значениями
  onMounted(() => {
    
  // Программно триггерим scroll событие
  window.dispatchEvent(new Event('scroll'))
    uniqueSpecs.value.forEach(spec => {
      dynamicFilters.value[spec] = ''
    })
  })

  const filtersCollapsed = ref(true)
  const toggleFiltersCollapsed = () => {
    filtersCollapsed.value = !filtersCollapsed.value
  }

  const filteredSpecs = computed(() =>
    uniqueSpecs.value.filter(
      spec => Array.isArray(specOptions.value[spec]) && specOptions.value[spec].length > 1
    )
  )
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
    padding-top: 40px;
  }
  
  .category-sidebar {
    background: none;
    border-radius: 8px;
    box-shadow: none;
    padding: 0;
    overflow: visible;
  }
  
  .filter-section {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 6px 32px rgba(0,0,0,0.10);
    padding: 0 0 0 0;
    margin-bottom: 24px;
    width: 100%;
    box-sizing: border-box;
    display: inline-block;
    min-width: 0;
    overflow: visible;
  }

  .filter-section__title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    user-select: none;
    font-size: 1.25rem;
    font-weight: 700;
    color: #222;
    padding: 20px 24px 20px 24px;
    border-radius: 16px 16px 0 0;
    transition: background 0.2s;
  }
  .filter-section__arrow {
    font-size: 1.2em;
    margin-left: 12px;
    color: #e31e24;
    transition: transform 0.3s cubic-bezier(.4,2,.6,1), color 0.2s;
    display: flex;
    align-items: center;
  }
  .filters-content {
    padding: 20px 24px 24px 24px;
    border-radius: 0 0 16px 16px;
    background: #fff;
    
    border-radius: 16px 16px 0 0;
    box-shadow: 0 2px 12px rgba(227,30,36,0.04);
    overflow: hidden;
  }

  /* Анимация выезда фильтров */
  .filters-slide-enter-active, .filters-slide-leave-active {
    transition: max-height 0.45s cubic-bezier(.4,2,.6,1), opacity 0.35s, padding 0.3s;
  }
  .filters-slide-enter-from, .filters-slide-leave-to {
    max-height: 0;
    opacity: 0;
    padding-top: 0;
    padding-bottom: 0;
  }
  .filters-slide-enter-to, .filters-slide-leave-from {
    max-height: 1200px;
    opacity: 1;
    padding-top: 20px;
    padding-bottom: 24px;
  }

  .filter-group {
    margin-bottom: 16px;
    border: 1px solid #ececec;
    border-radius: 10px;
    overflow: hidden;
    background: #fafbfc;
    box-shadow: 0 2px 8px rgba(227,30,36,0.03);
    transition: box-shadow 0.2s, border-color 0.2s;
  }

  .filter-group:hover {
    border-color: #e31e24;
    box-shadow: 0 4px 16px rgba(227,30,36,0.08);
  }

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 18px;
    background: #f8f9fa;
    cursor: pointer;
    font-weight: 600;
    color: #222;
    transition: background 0.2s;
    border-radius: 10px 10px 0 0;
  }

  .filter-header:hover {
    background: #f0f0f0;
  }

  .filter-arrow {
    display: flex;
    align-items: center;
    transition: transform 0.3s cubic-bezier(.4,2,.6,1);
  }

  .filter-arrow svg {
    display: block;
    transition: transform 0.3s cubic-bezier(.4,2,.6,1);
  }

  .filter-arrow.open svg {
    transform: rotate(180deg);
  }

  .filter-body {
    padding: 16px 18px 12px 18px;
    background: #fff;
    border-top: 1px solid #ececec;
    border-radius: 0 0 10px 10px;
  }

  .price-inputs {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    box-sizing: border-box;
  }

  .price-inputs input {
    flex: 1;
    padding: 10px 12px;
    border: 1px solid #eaeaea;
    border-radius: 6px;
    font-size: 0.95rem;
    transition: all 0.2s ease;
    background: #f8f9fa;
    width: 100%;
    box-sizing: border-box;
    min-width: 0;
  }

  .price-inputs input:focus {
    border-color: #e31e24;
    outline: none;
    box-shadow: 0 0 0 2px rgba(227, 30, 36, 0.08);
    background: #fff;
  }

  .price-inputs span {
    color: #666;
    font-weight: 500;
  }

  .filter-select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #eaeaea;
    border-radius: 6px;
    font-size: 0.95rem;
    background: #f8f9fa;
    color: #222;
    transition: all 0.2s ease;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8.825L1.175 4 2.05 3.125 6 7.075 9.95 3.125 10.825 4z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 32px;
    box-sizing: border-box;
    max-width: 100%;
  }

  .filter-select:focus {
    border-color: #e31e24;
    outline: none;
    box-shadow: 0 0 0 2px rgba(227, 30, 36, 0.08);
    background-color: #fff;
  }

  .filter-select option:first-child {
    color: #999;
    font-style: italic;
  }

  .filter-select option {
    color: #222;
    padding: 8px;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .clear-filter {
    margin-top: 12px;
    padding: 8px 16px;
    background: #f8f9fa;
    border: 1px solid #eaeaea;
    border-radius: 6px;
    color: #666;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
    font-weight: 500;
    box-sizing: border-box;
    text-align: center;
  }

  .clear-filter:hover {
    background: #e31e24;
    color: #fff;
    border-color: #e31e24;
  }

  .filter-actions {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    box-sizing: border-box;
  }

  .filter-actions .btn {
    width: 100%;
    padding: 12px;
    font-weight: 600;
    font-size: 0.95rem;
    border-radius: 8px;
    transition: all 0.3s ease;
    text-align: center;
  }

  .btn-primary {
    background: linear-gradient(45deg, #e31e24, #ff4d4d);
    color: #fff;
    border: none;
    box-shadow: 0 2px 8px rgba(227, 30, 36, 0.15);
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(227, 30, 36, 0.2);
  }

  .btn-secondary {
    background: #f8f9fa;
    color: #666;
    border: 1px solid #eaeaea;
  }

  .btn-secondary:hover {
    background: #f0f0f0;
    color: #222;
    border-color: #ddd;
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
    row-gap: 60px
  }
  
  .product-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    overflow: visible;
    transition: transform 0.3s, box-shadow 0.3s;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    height: 100%;
  }
  
  .product-card__clickable {
    cursor: pointer;
    transition: transform 0.3s, box-shadow 0.3s;
    flex: 1;
    padding: 24px 24px 0;
  }
  
  .product-card__clickable:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.13);
  }
  
  .product-card__img-wrap {
    height: 170px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    position: relative;
  }
  
  .product-image {
    width: 220px;
    height: 220px;
    object-fit: contain;
    border-radius: 8px;
    z-index: 2;
    margin-top: -80px;
    position: static;
  }
  
  .product-card__content {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  
  .product-card__title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 18px 0 10px 0;
  }
  
  .product-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #222;
    margin: 0;
    line-height: 1.2;
  }
  
  .product-title-icon {
    margin-left: 8px;
  }
  
  .product-card__specs {
    margin-bottom: 18px;
    flex-grow: 1;
  }
  
  .spec-item {
    display: flex;
    align-items: center;
    font-size: 1rem;
    margin-bottom: 4px;
  }
  .spec-item {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 0.85rem;
    padding: 0.1rem 0;
    gap: .5rem;
  }
  .spec-label {
    color: #222;
    font-weight: 600;
  }
  
  .spec-dots {
    flex: 1;
    border-bottom: 1px dotted #bbb;
    margin: 0 8px;
    height: 1px;
  }
  
  .spec-value {
    font-weight: 500;
    color: #333;
  }
  
  .product-card__bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    gap: 18px;
  }
  
  .product-card__price-block {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    background: #f7f7f7;
    border-radius: 8px;
    padding: 10px 18px 8px 18px;
  }
  
  .product-price {
    font-size: 2.1rem;
    font-weight: 700;
    color: #e31e24;
    line-height: 1;
  }
  
  .currency {
    font-size: 1.2rem;
  }
  
  .product-price-note {
    font-size: 0.9rem;
    color: #888;
    margin-top: 2px;
  }
  
  .buy-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    background: #fff;
    color: #e31e24;
    border: 1px solid #e31e24;
    border-radius: 8px;
    padding: 12px 22px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  
  .buy-btn:hover {
    background: #e31e24;
    color: #fff;
  }
  
  .offer-btn {
    width: 100%;
    margin-top: 24px;
    background: linear-gradient(45deg, #e31e24, #ff4d4d);
    color: #fff;
    border: none;
    padding: 16px 0;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    border-radius: 0 0 12px 12px;
    box-shadow: 0 -2px 10px rgba(227, 30, 36, 0.1);
  }
  
  .offer-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: 0.5s;
  }
  
  .offer-btn:hover {
    background: linear-gradient(45deg, #ff4d4d, #e31e24);
    transform: translateY(-2px);
    box-shadow: 0 -2px 15px rgba(227, 30, 36, 0.2);
  }
  
  .offer-btn:hover::before {
    left: 100%;
  }
  
  .offer-btn:active {
    transform: translateY(0);
    box-shadow: 0 -2px 5px rgba(227, 30, 36, 0.1);
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
    .spec-label {
      font-size: 0.7rem;
    }
    .spec-value {
      font-size: 0.7rem;
    }
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
    .filter-section {
      padding: 16px;
      width: 100%;
    }
    .filter-section h3 {
      font-size: 1.2rem;
      margin-bottom: 16px;
      padding-bottom: 10px;
    }
    .filter-header {
      padding: 12px;
    }
    .filter-body {
      padding: 12px;
    }
    .price-inputs {
      gap: 8px;
    }
    .price-inputs input,
    .filter-select {
      padding: 8px 10px;
      font-size: 0.9rem;
    }
    .clear-filter {
      padding: 8px 12px;
      font-size: 0.85rem;
    }
    .filter-actions {
      margin-top: 16px;
      gap: 8px;
    }
    .filter-actions .btn {
      padding: 10px;
      font-size: 0.9rem;
    }
    .products-grid {
      grid-template-columns: 1fr;
      gap: 64px;
    }
    .product-card {
      margin: 12px 12px 0;
    }
    .product-card__img-wrap {
      height: 90px;
    }
    .product-image {
      width: 150px;
      height: 150px;
      margin-top: -75px;
    }
    .product-card__content {
      padding: 0 10px 0 10px;
    }
    .product-title {
      font-size: 1.05rem;
      margin-bottom: 7px;
      text-align: center;
    }
    .product-card__specs {
      margin-bottom: 10px;
      font-size: 0.95rem;
      flex-grow: 1;
    }
    .product-card__bottom {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
    }
    .product-card__price-block {
      align-items: flex-start;
      padding: 8px 10px 6px 10px;
    }
    .product-price {
      font-size: 1.3rem;
    }
    .product-price-note {
      font-size: 0.8rem;
    }
    .buy-btn {
      width: 100%;
      justify-content: center;
      padding: 10px 0;
      font-size: 1rem;
    }
    .offer-btn {
      margin-top: 16px;
      padding: 12px 0;
      font-size: 1rem;
      box-shadow: 0 -1px 5px rgba(227, 30, 36, 0.1);
    }
    .offer-btn:hover {
      box-shadow: 0 -1px 10px rgba(227, 30, 36, 0.15);
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

  .category-slider { text-align: center; margin-bottom: 30px; }
  .slider-wrapper { position: relative; display: inline-block; }
  .slider-image { max-width: 400px; max-height: 250px; border-radius: 10px; }
  .slider-btn { position: absolute; top: 50%; transform: translateY(-50%); background: #fff; border: none; font-size: 2rem; cursor: pointer; padding: 0 10px; }
  .slider-btn.prev { left: -40px; }
  .slider-btn.next { right: -40px; }
  .slider-placeholder { color: #aaa; font-size: 1.2rem; padding: 40px 0; }

  .filter-divider {
    height: 1px;
    background: linear-gradient(90deg, #eee, #f7f7f7 60%, #eee);
    margin: 12px 0 6px 0;
    border-radius: 1px;
  }
  .products-count {
    font-size: 1.08rem;
    color: #444;
    margin: 0 0 18px 0;
    font-weight: 500;
    text-align: right;
  }

  .breadcrumbs {
    display: flex;
    align-items: center;
    font-size: 1rem;
    margin-bottom: 24px;
    gap: 8px;
  }
  .breadcrumbs-separator {
    color: #aaa;
    margin: 0 4px;
  }
  .breadcrumbs a {
    color: #e31e24;
    text-decoration: none;
    transition: text-decoration 0.2s;
  }
  .breadcrumbs a:hover {
    text-decoration: underline;
  }
  </style> 