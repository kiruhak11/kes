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

        <!-- Фильтры сверху -->
        <div class="filters-section" v-scroll-reveal="'fade-in-up'">
          <div class="filters-header" @click="toggleFiltersCollapsed" style="cursor:pointer; user-select:none;">
            <div class="filters-header__left">
              <svg class="filters-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 4h18M7 8h10M9 12h6M11 16h2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <h3 class="filters-header__title">Фильтры</h3>
              <span class="filters-count" v-if="!filtersCollapsed">({{ filteredSpecs.length + 1 }})</span>
            </div>
            <div class="filters-header__right">
              <div class="active-filters-badge" v-if="activeFiltersCount > 0">
                {{ activeFiltersCount }}
              </div>
              <span class="filters-header__arrow" :style="{ transform: filtersCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </div>
          </div>
          
          <transition name="filters-slide">
            <div v-show="!filtersCollapsed" class="filters-container">
              <div class="filters-toolbar">
                <div class="filters-info">
                  <span class="filters-subtitle">Настройте параметры поиска</span>
                </div>
                <div class="filters-actions">
                  <button class="clear-all-btn" @click.stop="resetFilters" v-if="activeFiltersCount > 0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Очистить все
                  </button>
                  <button class="reset-all-btn" @click.stop="resetAllFilters">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0z" stroke="currentColor" stroke-width="2"/>
                      <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Сбросить все
                  </button>
                </div>
              </div>
              
              <div class="filters-grid">
                <!-- Фильтр по цене -->
                <div class="filter-card price-filter" :class="{ active: priceRange.min || priceRange.max }">
                  <div class="filter-card__header">
                    <div class="filter-card__title-group">
                      <svg class="filter-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M8 6h6a3 3 0 1 1 0 6H8m0 0v6m0-6v-6m0 6h7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span class="filter-card__title">Цена</span>
                    </div>
                    <span class="filter-card__arrow open">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </span>
                  </div>
                  <div class="filter-card__body">
                    <div class="filter-content">
                      <div class="price-range">
                        <div class="price-inputs">
                          <div class="price-input-group">
                            <label>От</label>
                            <div class="input-wrapper">
                              <input type="number" v-model="priceRange.min" placeholder="0" />
                              <span class="currency-symbol">₽</span>
                            </div>
                          </div>
                          <div class="price-separator"></div>
                          <div class="price-input-group">
                            <label>До</label>
                            <div class="input-wrapper">
                              <input type="number" v-model="priceRange.max" placeholder="∞" />
                              <span class="currency-symbol">₽</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Динамические фильтры -->
                <div v-for="spec in filteredSpecs" :key="spec" class="filter-card" :class="{ active: dynamicFilters[spec] || (rangeFilters[spec] && (dynamicRangeFilters[spec]?.min !== undefined || dynamicRangeFilters[spec]?.max !== undefined)) }">
                  <div class="filter-card__header">
                    <div class="filter-card__title-group">
                      <svg class="filter-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 3h18v18H3zM8 12h8M12 8v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <span class="filter-card__title">{{ spec.slice(0, 24) + (spec.length > 24 ? '...' : '') }}</span>
                    </div>
                    <span class="filter-card__arrow open">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </span>
                  </div>
                  <div class="filter-card__body">
                    <div class="filter-content">
                                             <template v-if="rangeFilters[spec]">
                         <div class="price-range">
                           <div class="price-inputs">
                             <div class="price-input-group">
                               <label>От</label>
                               <div class="input-wrapper">
                                 <input type="number" :value="getRangeFilterValue(spec, 'min')" @input="updateRangeFilter(spec, 'min', $event)" placeholder="0" />
                               </div>
                             </div>
                             <div class="price-separator"></div>
                             <div class="price-input-group">
                               <label>До</label>
                               <div class="input-wrapper">
                                 <input type="number" :value="getRangeFilterValue(spec, 'max')" @input="updateRangeFilter(spec, 'max', $event)" placeholder="∞" />
                               </div>
                             </div>
                           </div>
                         </div>
                       </template>
                      <template v-else-if="specOptions[spec] && specOptions[spec].length > 0">
                        <div v-if="specOptions[spec].length <= 8" class="select-wrapper">
                          <select v-model="dynamicFilters[spec]" class="filter-select">
                            <option value="">Выберите {{ spec.toLowerCase() }}</option>
                            <option v-for="option in specOptions[spec]" :key="option" :value="option">{{ option }}</option>
                          </select>
                        </div>
                        <div v-else class="search-wrapper">
                          <input type="text" v-model="dynamicFilters[spec]" :placeholder="`Введите ${spec.toLowerCase()}`" class="filter-search" />
                        </div>
                      </template>
                    </div>
                    <button v-if="dynamicFilters[spec] || (rangeFilters[spec] && (dynamicRangeFilters[spec]?.min !== undefined || dynamicRangeFilters[spec]?.max !== undefined))" class="clear-filter-btn" @click="clearFilter(spec)">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                      Сбросить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- Товары -->
        <div class="products-section" >
          <div class="products-header">
            <div class="products-count" v-if="filteredProducts.length > 0">
              Найдено товаров: <strong>{{ filteredProducts.length }}</strong>
            </div>
          </div>
          
          <div class="products-grid">
            <div
              v-for="(product, index) in paginatedProducts"
              :key="product.id"
              class="product-card"
              v-scroll-reveal="index % 3 === 0 ? 'slide-in-left' : index % 3 === 1 ? 'fade-in-up' : 'slide-in-right'"
            >
              <div class="product-card__clickable" @click="router.push(`/catalog/${product.category_slug}/${generateProductSlug(product)}`)">
                <div class="product-card__img-wrap">
                  <img
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
        </div>
      </div>
      <div class="pagination" v-if="totalPages > 1" v-scroll-reveal="'fade-in-up'">
        <button 
          class="pagination-btn pagination-btn--arrow" 
          :disabled="currentPage === 1"
          @click="goToPage(1)"
          aria-label="Первая страница"
        >
          «
        </button>
        <button 
          class="pagination-btn pagination-btn--arrow" 
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
          aria-label="Назад"
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" fill="none"/></svg>
        </button>
        <span v-for="page in visiblePages" :key="page">
          <button 
            class="pagination-btn" 
            :class="{ 'active': page === currentPage }"
            @click="goToPage(page)"
            :disabled="page === currentPage"
          >
            {{ page }}
          </button>
        </span>
        <button 
          class="pagination-btn pagination-btn--arrow" 
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
          aria-label="Вперед"
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none"/></svg>
        </button>
        <button 
          class="pagination-btn pagination-btn--arrow" 
          :disabled="currentPage === totalPages"
          @click="goToPage(totalPages)"
          aria-label="Последняя страница"
        >
          »
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
  import { ref, computed, watch, onMounted, nextTick } from 'vue'
  import { useCartStore } from '~/stores/cart'
  import { useRoute, useRouter } from 'vue-router'
  import CommercialOfferModal from '~/components/CommercialOfferModal.vue'
  import type { Characteristic } from '~/types/product'
  import { useNuxtApp } from 'nuxt/app'

  const { $vScrollReveal } = useNuxtApp()

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
  const itemsPerPage = 21

  // Products state
  const allProducts = ref<Product[]>([])

  // Fetch products
  const { data: fetchedAllProducts, error: fetchError } = await useFetch(`/api/products`, {
    query: {
      categorySlug: route.params.category
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

  // 1. Собираем все уникальные характеристики из specs, только с show_in_filters: true
  const uniqueSpecs = computed<string[]>(() => {
    const specsSet = new Set<string>()
    productsInCategory.value.forEach(product => {
      if (product.specs && Array.isArray(product.specs)) {
        product.specs.forEach(spec => {
          if (spec.key && spec.show_in_filters) specsSet.add(spec.key)
        })
      }
    })
    return Array.from(specsSet)
  })

  // 2. Собираем возможные значения для каждой характеристики (только show_in_filters)
  const specOptions = computed(() => {
    const options: Record<string, Set<any>> = {}
    productsInCategory.value.forEach(product => {
      if (product.specs && Array.isArray(product.specs)) {
        product.specs.forEach(spec => {
          if (spec.key && spec.value && spec.show_in_filters) {
            if (!options[spec.key]) options[spec.key] = new Set()
            options[spec.key].add(spec.value)
          }
        })
      }
    })
    // Преобразуем Set в массивы
    return Object.fromEntries(Object.entries(options).map(([k, v]) => [k, Array.from(v)]))
  })

  // 1. Определяем, какие фильтры являются диапазонными (например, '100 - 200')
  function isRangeValue(val: string): boolean {
    if (!val) return false;
    // Поддержка формата 'число - число', допускается пробелы
    return /^\s*\d+(?:[.,]\d+)?\s*[-–—]\s*\d+(?:[.,]\d+)?\s*$/.test(val);
  }

  const rangeFilters = computed(() => {
    const result: Record<string, boolean> = {};
    for (const key of uniqueSpecs.value) {
      const options = specOptions.value[key] as string[];
      if (options && options.length > 0 && options.every(isRangeValue)) {
        result[key] = true;
      }
    }
    return result;
  });

  // 2. Состояние для диапазонных фильтров
  const dynamicRangeFilters = ref<Record<string, { min: number | undefined, max: number | undefined }>>({});

  // 3. Состояние фильтров по характеристикам
  const dynamicFilters = ref<Record<string, any>>({})

  const priceRange = ref({
    min: undefined as number | undefined,
    max: undefined as number | undefined
  })

  // 3. Модифицируем filteredProducts для поддержки диапазонных фильтров
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
                 if (rangeFilters.value[key]) {
           // Диапазонный фильтр
           const { min, max } = dynamicRangeFilters.value[key] || {};
           if (min === undefined && max === undefined) continue;
           const specItem = product.specs?.find(spec => spec.key === key);
           if (!specItem) continue;
           // Парсим диапазон из значения характеристики
           const match = typeof specItem.value === 'string' && specItem.value.match(/(\d+(?:[.,]\d+)?)[^\d]+(\d+(?:[.,]\d+)?)/);
           if (!match) continue;
           const valMin = parseFloat(match[1].replace(',', '.'));
           const valMax = parseFloat(match[2].replace(',', '.'));
           
           // Проверяем, что товар начинается с указанного минимума и заканчивается указанным максимумом
           if (min !== undefined && valMin > min) return false; // Минимум товара больше минимума фильтра
           if (max !== undefined && valMax < max) return false; // Максимум товара меньше максимума фильтра
         } else {
          // Обычный фильтр
          const filterValue = dynamicFilters.value[key]
          if (filterValue === undefined || filterValue === '' || (Array.isArray(filterValue) && filterValue.length === 0)) continue
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

  const totalPages = computed(() => Math.max(1, Math.ceil(filteredProducts.value.length / itemsPerPage)))

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
    uniqueSpecs.value.forEach(spec => {
      dynamicFilters.value[spec] = ''
      if (rangeFilters.value[spec]) dynamicRangeFilters.value[spec] = { min: undefined, max: undefined }
    })
    priceRange.value = {
      min: undefined,
      max: undefined
    }
  }

  function resetAllFilters() {
    uniqueSpecs.value.forEach(spec => {
      dynamicFilters.value[spec] = ''
      if (rangeFilters.value[spec]) dynamicRangeFilters.value[spec] = { min: undefined, max: undefined }
    })
    priceRange.value = {
      min: undefined,
      max: undefined
    }
    currentPage.value = 1
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isMobile = ref(false)
  onMounted(() => {
    isMobile.value = window.innerWidth <= 768
    window.addEventListener('resize', () => {
      isMobile.value = window.innerWidth <= 768
    })
  })

  const openFilters = ref<Record<string, boolean>>({})
  const priceFilterOpen = ref(true) // Всегда открыт

  function toggleSpecFilter(spec: string) {
    // Функция оставлена для совместимости, но не используется
  }

  function togglePriceFilter() {
    // Функция оставлена для совместимости, но не используется
  }

  function clearFilter(spec: string) {
    dynamicFilters.value[spec] = ''
    if (rangeFilters.value[spec] && dynamicRangeFilters.value[spec]) {
      dynamicRangeFilters.value[spec] = { min: undefined, max: undefined }
    }
  }

  function getRangeFilterValue(spec: string, field: 'min' | 'max'): number | undefined {
    return dynamicRangeFilters.value[spec]?.[field]
  }

  function updateRangeFilter(spec: string, field: 'min' | 'max', event: Event) {
    const target = event.target as HTMLInputElement
    const value = target.value === '' ? undefined : Number(target.value)
    
    if (!dynamicRangeFilters.value[spec]) {
      dynamicRangeFilters.value[spec] = { min: undefined, max: undefined }
    }
    
    dynamicRangeFilters.value[spec][field] = value
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
      openFilters.value[spec] = true // Все дропдауны всегда открыты
      // Инициализируем диапазонные фильтры
      if (rangeFilters.value[spec]) {
        dynamicRangeFilters.value[spec] = { min: undefined, max: undefined }
      }
    })
  })

  // Следим за изменениями rangeFilters и инициализируем новые диапазонные фильтры
  watch(rangeFilters, (newRangeFilters) => {
    Object.keys(newRangeFilters).forEach(spec => {
      if (newRangeFilters[spec] && !dynamicRangeFilters.value[spec]) {
        dynamicRangeFilters.value[spec] = { min: undefined, max: undefined }
      }
    })
  }, { immediate: true })

  const filtersCollapsed = ref(true)
  const toggleFiltersCollapsed = () => {
    filtersCollapsed.value = !filtersCollapsed.value
  }

  // 4. filteredSpecs - только характеристики с show_in_filters
  const filteredSpecs = computed(() =>
    uniqueSpecs.value.filter(
      spec => Array.isArray(specOptions.value[spec]) && specOptions.value[spec].length > 1
    )
  )

  // Подсчет активных фильтров
  const activeFiltersCount = computed(() => {
    let count = 0
    if (priceRange.value.min !== undefined || priceRange.value.max !== undefined) {
      count++
    }
    Object.values(dynamicFilters.value).forEach(value => {
      if (value && value !== '') {
        count++
      }
    })
    return count
  })

  // Следим за изменениями в paginatedProducts, чтобы обновить scroll-reveal
  watch(paginatedProducts, async () => {
    await nextTick();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('resize'));
    }
  }, { immediate: true, deep: true })

  // Красивый вывод номеров страниц (максимум 5 одновременно)
  const visiblePages = computed(() => {
    const pages = []
    if (totalPages.value <= 5) {
      for (let i = 1; i <= totalPages.value; i++) pages.push(i)
    } else if (currentPage.value <= 3) {
      pages.push(1, 2, 3, 4, 5)
    } else if (currentPage.value >= totalPages.value - 2) {
      for (let i = totalPages.value - 4; i <= totalPages.value; i++) pages.push(i)
    } else {
      for (let i = currentPage.value - 2; i <= currentPage.value + 2; i++) pages.push(i)
    }
    return pages.filter(p => p >= 1 && p <= totalPages.value)
  })
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
  
  /* Фильтры сверху - Премиум дизайн */
  .filters-section {
    margin: 40px 0;
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.08);
    overflow: hidden;
    border: 1px solid #f0f0f0;
  }

  .filters-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 32px;
    background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .filters-header:hover {
    background: linear-gradient(135deg, #f5f6f7 0%, #fafbfc 100%);
  }

  .filters-header__left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .filters-icon {
    color: #e31e24;
    opacity: 0.8;
  }

  .filters-header__title {
    font-size: 1.4rem;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
    letter-spacing: -0.02em;
  }

  .filters-count {
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
    margin-left: 4px;
  }

  .filters-header__right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .active-filters-badge {
    background: linear-gradient(135deg, #e31e24, #ff4d4d);
    color: #fff;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 700;
    min-width: 24px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(227, 30, 36, 0.3);
  }

  .filters-header__arrow {
    color: #666;
    transition: transform 0.3s cubic-bezier(.4,2,.6,1);
    display: flex;
    align-items: center;
  }

  .filters-container {
    background: #fff;
  }

  .filters-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 32px 16px;
    border-bottom: 1px solid #f5f5f5;
  }

  .filters-actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .filters-subtitle {
    font-size: 0.95rem;
    color: #666;
    font-weight: 500;
  }

  .clear-all-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: 1px solid #e0e0e0;
    color: #666;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .clear-all-btn:hover {
    background: #f8f9fa;
    border-color: #e31e24;
    color: #e31e24;
  }

  .reset-all-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #e31e24, #ff4d4d);
    border: none;
    color: #fff;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(227, 30, 36, 0.2);
  }

  .reset-all-btn:hover {
    background: linear-gradient(135deg, #ff4d4d, #e31e24);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(227, 30, 36, 0.3);
  }

  .filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    padding: 24px 32px 32px;
  }

  .filter-card {
    background: #fff;
    border: 1px solid #f0f0f0;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(.4,2,.6,1);
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .filter-card:hover {
    border-color: #e31e24;
    box-shadow: 0 6px 24px rgba(227,30,36,0.15);
    transform: translateY(-2px);
  }

  .filter-card.active {
    border-color: #e31e24;
    background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
  }

  .filter-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px;
    background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);
    transition: all 0.2s ease;
  }

  .filter-card__title-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .filter-icon {
    color: #e31e24;
    opacity: 0.7;
  }

  .filter-card__title {
    font-weight: 600;
    color: #1a1a1a;
    font-size: 1rem;
    letter-spacing: -0.01em;
  }

  .filter-card__arrow {
    display: flex;
    align-items: center;
    transition: transform 0.3s cubic-bezier(.4,2,.6,1);
    color: #666;
  }

  .filter-card__arrow.open {
    transform: rotate(180deg);
    color: #e31e24;
  }

  .filter-card__body {
    padding: 20px;
    background: #fff;
    border-top: 1px solid #f5f5f5;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .filter-content {
    flex: 1;
    display: flex;
    align-items: flex-start;
  }



  /* Стили для фильтра цены */
  .price-range {
    background: #fafbfc;
    border-radius: 10px;
    padding: 16px;
    width: 100%;
  }

  .price-inputs {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .price-input-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .price-input-group label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-wrapper input {
    width: 100%;
    padding: 12px 16px 12px 12px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 0.95rem;
    transition: all 0.2s ease;
    background: #fff;
    font-weight: 500;
    color: #1a1a1a;
  }

  .input-wrapper input:focus {
    border-color: #e31e24;
    outline: none;
    box-shadow: 0 0 0 3px rgba(227, 30, 36, 0.1);
  }

  .input-wrapper input::placeholder {
    color: #999;
    font-weight: 400;
  }

  .currency-symbol {
    position: absolute;
    right: 12px;
    color: #666;
    font-weight: 500;
    font-size: 0.9rem;
  }

  .price-separator {
    width: 1px;
    height: 40px;
    background: linear-gradient(180deg, transparent, #e0e0e0, transparent);
    margin: 0 8px;
  }

  /* Стили для селектов и поиска */
  .select-wrapper, .search-wrapper {
    position: relative;
    width: 100%;
  }

  .filter-select {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 0.95rem;
    background: #fff;
    color: #1a1a1a;
    transition: all 0.2s ease;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8.825L1.175 4 2.05 3.125 6 7.075 9.95 3.125 10.825 4z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 36px;
    font-weight: 500;
  }

  .filter-select:focus {
    border-color: #e31e24;
    outline: none;
    box-shadow: 0 0 0 3px rgba(227, 30, 36, 0.1);
  }

  .filter-select option {
    padding: 8px;
    font-weight: 500;
    color: #1a1a1a;
  }

  .filter-search {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 0.95rem;
    background: #fff;
    transition: all 0.2s ease;
    font-weight: 500;
    color: #1a1a1a;
  }

  .filter-search:focus {
    border-color: #e31e24;
    outline: none;
    box-shadow: 0 0 0 3px rgba(227, 30, 36, 0.1);
  }

  .filter-search::placeholder {
    color: #999;
    font-weight: 400;
  }

  .clear-filter-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: auto;
    padding: 10px 16px;
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    color: #666;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .clear-filter-btn:hover {
    background: #e31e24;
    color: #fff;
    border-color: #e31e24;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(227, 30, 36, 0.25);
  }

  /* Секция товаров */
  .products-section {
    margin-top: 40px;
  }

  .products-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding: 20px 0;
  }

  .products-count {
    font-size: 1.1rem;
    color: #444;
    font-weight: 500;
  }

  .products-actions {
    display: flex;
    gap: 12px;
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
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
    row-gap: 60px;
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
    border-radius: 12px 12px 0 0;
    box-shadow: 0 24px 24px rgba(0,0,0,0.13);
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
    font-size: 1.8rem;
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
    .products-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .filters-grid {
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }
  }
  
  @media (max-width: 992px) {
    .products-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .filters-grid {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    }
    
    .filters-header {
      padding: 20px 24px;
    }
    
    .filters-toolbar {
      padding: 16px 24px 12px;
    }
    
    .filters-grid {
      padding: 20px 24px 28px;
    }
    
    .products-header {
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;
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
    
    .filters-section {
      margin: 20px 0;
      border-radius: 16px;
    }
    
    .filters-header {
      padding: 16px 20px;
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
    }
    
    .filters-header__right {
      width: 100%;
      justify-content: space-between;
    }
    
    .filters-toolbar {
      padding: 12px 20px 8px;
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
    }
    
    .filters-actions {
      width: 100%;
      justify-content: space-between;
    }
    
    .filters-grid {
      grid-template-columns: 1fr;
      gap: 12px;
      padding: 16px 20px 24px;
    }
    
    .filter-card__header {
      padding: 14px 16px;
    }
    
    .filter-card__body {
      padding: 16px;
    }
    
    .price-range {
      padding: 12px;
    }
    
    .price-inputs {
      flex-direction: column;
      gap: 12px;
    }
    
    .price-separator {
      display: none;
    }
    
    .input-wrapper input,
    .filter-select,
    .filter-search {
      padding: 10px 12px;
      font-size: 0.9rem;
    }
    
    .clear-filter-btn {
      padding: 8px 12px;
      font-size: 0.8rem;
    }
    
    .products-grid {
      grid-template-columns: 1fr;
      gap: 40px;
    }
    
    .product-card {
      margin: 0;
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
    gap: 8px;
    margin: 32px 0 0 0;
  }

  .pagination-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: none;
    background: #f5f5f5;
    color: #e31e24;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 8px rgba(227,30,36,0.07);
    display: flex;
    align-items: center;
    justify-content: center;
    outline: none;
  }

  .pagination-btn.active,
  .pagination-btn:disabled {
    background: #e31e24;
    color: #fff;
    cursor: default;
    box-shadow: 0 4px 12px rgba(227,30,36,0.15);
  }

  .pagination-btn--arrow {
    font-size: 1.3rem;
    background: #fff;
    color: #e31e24;
    border: 1px solid #e31e24;
    width: 38px;
    height: 38px;
    min-width: 38px;
    min-height: 38px;
    padding: 0;
  }

  .pagination-btn--arrow:disabled {
    background: #f5f5f5;
    color: #ccc;
    border-color: #eee;
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