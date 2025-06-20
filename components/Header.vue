<template>
  <header class="header">
    <div v-if="!$device.isMobile" class="header__top">
      <div class="container">
        <div  class="header__top-content">
          <div class="header__contacts">
            <a href="mailto:{{ contacts.email }}" class="header__email">{{ contacts.email }}</a>
            <a href="tel:{{ contacts.phone[0] }}" class="header__phone">{{ contacts.phone[0] }}</a>
            <NuxtLink to="/contact" class="header__callback">Заказать звонок</NuxtLink>
          </div>
          <div class="form-group">
            <div class="search-container">
              <div class="search-input-wrapper">
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  placeholder="Поиск котлов..."
                  class="search-input"
                  @focus="handleSearchInput"
                  @input="handleSearchInput"
                >
                <span class="search-icon"><IconsSearch/></span>
              </div>
              <div class="search-results" v-if="showSearchResults">
                <div v-if="filteredProducts.length" class="search-results-list">
                  <div 
                    v-for="product in filteredProducts" 
                    :key="product.id"
                    class="search-result-item"
                    @click="selectProduct(product)"
                  >
                    <div class="product-info">
                      <div class="product-image">
                        <img :src="product.image" :alt="product.name">
                      </div>
                      <div class="product-details">
                        <div class="product-main">
                          <span class="product-name">{{ product.name }}</span>
                          <span class="product-price">{{ product.price.toLocaleString() }} ₽</span>
                        </div>
                        <div class="product-specs" v-if="product.specs">
                          <span v-if="product.specs.power && product.specs.power !== 'отсутствует'" class="product-spec">
                            <span class="spec-icon">⚡</span>
                            {{ product.specs.power }}
                          </span>
                          <span v-if="product.specs.fuel && (!Array.isArray(product.specs.fuel) || product.specs.fuel.length > 0) && product.specs.fuel !== 'отсутствует'" class="product-spec">
                            <span class="spec-icon">🔥</span>
                            {{ Array.isArray(product.specs.fuel) ? product.specs.fuel.join(', ') : product.specs.fuel }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="no-results">
                  {{ searchQuery ? 'Ничего не найдено' : 'Введите название товара' }}
                </div>
              </div>
            </div>
          </div>
          <div class="header__user-actions">
            <NuxtLink to="/catalog" class="header__nav-link catalog-link">Каталог продукции</NuxtLink>
            <NuxtLink to="/about/contacts" class="header__nav-link">Контакты</NuxtLink>
            <div class="cart-container">
              <NuxtLink to="/cart" class="cart-link">
                <span class="cart-text">Корзина</span>
                <div class="cart-icon-wrapper">
                  <span class="cart-icon">🛒</span>
                  <span v-if="isHydrated" class="cart-count">{{ cartCount }}</span>
                  <span v-else class="cart-count">0</span>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="header__main">
      <div class="container">
        <div class="header__main-content">
          <div class="header__logo">
            <NuxtLink to="/">
              <img src="/images/logo.png" alt="Котельный завод КЭС" />
            </NuxtLink>
          </div>
          <div v-if="$device.isMobile" class="mobile-header-actions">
            <button class="mobile-search-btn" @click="showMobileSearch = true">
              <IconsSearch />
            </button>
            <button 
              class="burger-btn" 
              :class="{ 'is-active': showMobileMenu }"
              @click="showMobileMenu = !showMobileMenu"
            >
            <label class="burger" for="burger">
              <input type="checkbox" id="burger" @click="showMobileMenu = !showMobileMenu">
              <span></span>
              <span></span>
              <span></span>
            </label>
            </button>
            <transition name="slide-fade">
              <nav v-if="showMobileMenu" class="mobile-nav">
                <div class="mobile-nav-header">
                  <h3>Меню</h3>
                  <button class="close-btn" @click="showMobileMenu = false">×</button>
                </div>
                <ul class="mobile-menu">
                  <li>
                    <NuxtLink to="/catalog" @click="showMobileMenu = false" class="mobile-menu-item">
                      <span class="menu-icon">📋</span>
                      <span>Каталог продукции</span>
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/about/contacts" @click="showMobileMenu = false" class="mobile-menu-item">
                      <span class="menu-icon">📞</span>
                      <span>Контакты</span>
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/about" @click="showMobileMenu = false" class="mobile-menu-item">
                      <span class="menu-icon">🏢</span>
                      <span>О компании</span>
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/about/gallery" @click="showMobileMenu = false" class="mobile-menu-item">
                      <span class="menu-icon">🖼️</span>
                      <span>Фотогалерея</span>
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/certificates" @click="showMobileMenu = false" class="mobile-menu-item">
                      <span class="menu-icon">📜</span>
                      <span>Сертификаты</span>
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/cart" @click="showMobileMenu = false" class="mobile-menu-item">
                      <span class="menu-icon">🛒</span>
                      <span>Корзина</span>
                      <span class="cart-badge" v-if="cartStore.totalItems">{{ cartStore.totalItems }}</span>
                    </NuxtLink>
                  </li>
                </ul>
              </nav>
            </transition>
            <transition name="fade">
              <div v-if="showMobileMenu" class="mobile-menu-overlay" @click="showMobileMenu = false"></div>
            </transition>
            <transition name="fade">
              <div v-if="showMobileSearch" class="mobile-search-modal">
                <div class="mobile-search-header">
                  <button class="close-btn" @click="showMobileSearch = false">×</button>
                  <div class="mobile-search-bar">
                    <input 
                      type="text" 
                      v-model="searchQuery" 
                      placeholder="Поиск котлов..."
                      class="search-input"
                      @focus="handleSearchInput"
                      @input="handleSearchInput"
                      autofocus
                    >
                    <span class="search-icon"><IconsSearch/></span>
                  </div>
                </div>
                <div class="search-results-mobile" v-if="showSearchResults">
                  <div v-if="filteredProducts.length" class="search-results-list">
                    <div 
                      v-for="product in filteredProducts" 
                      :key="product.id"
                      class="search-result-item"
                      @click="selectProduct(product)"
                    >
                      <div class="product-info">
                        <div class="product-image">
                          <img :src="product.image" :alt="product.name">
                        </div>
                        <div class="product-details">
                          <div class="product-main">
                            <span class="product-name">{{ product.name }}</span>
                            <span class="product-price">{{ product.price.toLocaleString() }} ₽</span>
                          </div>
                          <div class="product-specs" v-if="product.specs">
                            <span v-if="product.specs.power && product.specs.power !== 'отсутствует'" class="product-spec">
                              <span class="spec-icon">⚡</span>
                              {{ product.specs.power }}
                            </span>
                            <span v-if="product.specs.fuel && (!Array.isArray(product.specs.fuel) || product.specs.fuel.length > 0) && product.specs.fuel !== 'отсутствует'" class="product-spec">
                              <span class="spec-icon">🔥</span>
                              {{ Array.isArray(product.specs.fuel) ? product.specs.fuel.join(', ') : product.specs.fuel }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="no-results">
                    {{ searchQuery ? 'Ничего не найдено' : 'Введите название товара' }}
                  </div>
                </div>
              </div>
            </transition>
          </div>
          <nav class="header__nav" v-else>
            <ul class="header__menu">
            <a href="/questionnaire" class="header__link">Опросные листы</a>
            <a href="/certificates" class="header__link">Сертификаты</a>
            <a href="/about" class="header__link">О компании</a>
            <a href="/about/gallery" class="header__link">Фотогалерея</a>
              </ul>
          </nav>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useNuxtApp, useRoute, useRouter } from '#app'
import { useCartStore } from '~/stores/cart'
import { contacts } from '~/data/contacts'
import type { Ref } from 'vue'

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
  extendedDescription?: string
  price: number
  image: string
  category: string
  category_name?: string
  category_id?: string
  category_slug?: string
  slug: string
  specs?: {
    power?: string
    fuel?: string | string[]
    [key: string]: any
  }
}

interface Boiler {
  id: number;
  name: string;
  power?: string;
  fuel?: string;
  price: number;
  slug: string;
  category: string;
}

interface ApiProduct {
  id: number
  name: string
  description: string
  extendedDescription: string | null
  price: number
  image: string
  category: string
  category_name?: string
  category_id?: string
  category_slug?: string
  slug: string
  specs?: {
    power?: string
    fuel?: string | string[]
    [key: string]: any
  }
}

const { $device } = useNuxtApp()
const showMobileMenu = ref(false)
const cartStore = useCartStore()
const searchQuery = ref('')
const showSearchResults = ref(false)
const cartCount: Ref<number> = ref(0)
const isHydrated: Ref<boolean> = ref(false)
const showMobileSearch = ref(false)

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

// Получаем список товаров из API
const { data: fetchedProducts, error: fetchError } = await useFetch<{ products: ApiProduct[] }>('/api/products', {
  transform: (response) => {
    if (!response || !response.products) {
      console.error('Invalid response format:', response)
      return { products: [] }
    }
    return response
  }
})

// Инициализируем список товаров
const products = ref<Product[]>([])

// Обрабатываем ошибки загрузки
if (fetchError.value) {
  console.error('Error fetching products:', fetchError.value)
  products.value = []
} else if (fetchedProducts.value) {
  products.value = fetchedProducts.value.products.map(product => {
    const specs = product.specs || {}
    return {
      ...product,
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      image: product.image || '',
      category: product.category || '',
      slug: product.slug || '',
      specs: {
        ...specs,
        power: specs.power && specs.power !== 'отсутствует' ? specs.power : undefined,
        fuel: specs.fuel && specs.fuel !== 'отсутствует' 
          ? (Array.isArray(specs.fuel) 
              ? specs.fuel.filter(f => f !== 'отсутствует')
              : specs.fuel.split(', ').map(f => f.trim()).filter(f => f !== 'отсутствует'))
          : undefined
      }
    } as Product
  })
} else {
  products.value = []
}

// Получаем список котлов
const boilers = ref<Boiler[]>([])

// Получаем подсказки на основе ввода
const suggestions = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  const uniqueSuggestions = new Set<string>()
  
  products.value.forEach(product => {
    if (product.name.toLowerCase().includes(query)) {
      uniqueSuggestions.add(product.name)
    }
    if (product.description?.toLowerCase().includes(query)) {
      uniqueSuggestions.add(product.description)
    }
  })
  
  return Array.from(uniqueSuggestions).slice(0, 5)
})

// Фильтруем товары по поисковому запросу
const filteredProducts = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return products.value.filter(product => {
    const nameMatch = product.name.toLowerCase().includes(query)
    const descriptionMatch = product.description?.toLowerCase().includes(query) || false
    const powerMatch = product.specs?.power?.toLowerCase().includes(query) || false
    
    let fuelMatch = false
    if (product.specs?.fuel) {
      if (Array.isArray(product.specs.fuel)) {
        fuelMatch = product.specs.fuel.some(fuel => fuel.toLowerCase().includes(query))
      } else {
        fuelMatch = product.specs.fuel.toLowerCase().includes(query)
      }
    }
    
    return nameMatch || descriptionMatch || powerMatch || fuelMatch
  })
})

// Загружаем котлы из каталога
const loadBoilers = async () => {
  try {
    const { data } = await useFetch<Boiler[]>('/api/catalog/boilers')
    if (data.value && Array.isArray(data.value)) {
      boilers.value = data.value.map(boiler => ({
        ...boiler,
        category: boiler.fuel?.toLowerCase().includes('газ') 
          ? 'gazovye-kotly' 
          : 'tverdotoplivnye-kotly'
      }))
    }
  } catch (error) {
    console.error('Ошибка при загрузке котлов:', error)
  }
}

// Фильтруем котлы по поисковому запросу
const filteredBoilers = computed(() => {
  if (!searchQuery.value) {
    return boilers.value // Показываем все котлы, если поисковый запрос пустой
  }
  const query = searchQuery.value.toLowerCase()
  const filtered = boilers.value.filter(boiler => 
    boiler.name.toLowerCase().includes(query) ||
    boiler.power?.toLowerCase().includes(query) ||
    boiler.fuel?.toLowerCase().includes(query)
  )
  return filtered
})

// Обработчик выбора товара
const selectProduct = (product: Product) => {
  searchQuery.value = product.name
  showSearchResults.value = false
  showMobileSearch.value = false
  // Используем category_slug если он есть, иначе генерируем из category
  const categorySlug = product.category_slug || transliterate(product.category).toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  
  // Используем существующий slug если он есть, иначе генерируем из имени
  const productSlug = product.slug || transliterate(product.name).toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  
  // Переходим на страницу товара
  navigateTo(`/catalog/${categorySlug}/${productSlug}`)
}

// Обработчик выбора подсказки
const selectSuggestion = (suggestion: string) => {
  searchQuery.value = suggestion
  showSearchResults.value = true
}

// Обработчик выбора котла
const selectBoiler = (boiler: Boiler) => {
  searchQuery.value = boiler.name
  showSearchResults.value = false
  
  // Определяем категорию на основе типа топлива
  const category = boiler.fuel?.toLowerCase().includes('газ') 
    ? 'gazovye-kotly' 
    : 'tverdotoplivnye-kotly'
    
  navigateTo(`/catalog/${category}/${boiler.slug}`)
}

// Обработчик ввода в поле поиска
const handleSearchInput = () => {
  showSearchResults.value = true
}

// Закрываем результаты поиска при клике вне
function closeSearchOnOutsideClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.search-container')) {
    showSearchResults.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeSearchOnOutsideClick)
  loadBoilers() // Загружаем котлы при монтировании компонента
  isHydrated.value = true
  cartCount.value = cartStore.totalItems
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeSearchOnOutsideClick)
})
</script>

<style lang="scss" scoped>
.form-group {
    display: flex;
    flex-direction: column;
    
    label {
      margin-bottom: 0.5rem;
      font-weight: 500;
      font-size: 0.95rem;

      @media (min-width: 768px) {
        font-size: 1rem;
      }
    }

    input,
    textarea {
      padding: 0.75rem;
      border: 1px solid var(--secondary);
      border-radius: 0.5rem;
      background: var(--bg);
      color: var(--text);
      transition: border-color 0.2s;
      font-size: 0.95rem;
      width: 100%;

      @media (min-width: 768px) {
        font-size: 1rem;
      }

      &:focus {
        border-color: var(--accent);
        outline: none;
      }
    }

    textarea {
      min-height: 120px;
      resize: vertical;
    }
  }
.region-select {
  position: relative;
}

.region-search {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}
.line {
  height: 2px;
  background-color: black;
}
.header {
  margin-top: 75px;
  background-color: #f5f5f5;
  @media (max-width: 768px) {
    margin-top: 0;
  }
}

.header__top {
  background: #f5f5f5;
  padding: 10px 0;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header__top-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header__contacts {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header__email,
.header__phone {
  color: #333;
  text-decoration: none;
  font-size: 14px;
}

.header__callback {
  background: #e31e24;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
}

.header__user-actions {
  display: flex;
  align-items: center;
  gap: 24px;
}


.header__nav-link {
  color: #333;
  text-decoration: none;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.header__nav-link:hover {
  color: #e31e24;
}
.catalog-link {
  justify-content: center;
  box-sizing: border-box;
  border-radius: 12px;
  border: 1.5px solid #e31e24;
  box-shadow: 0 2px 16px rgba(227,30,36,0.07);
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.25s, border-color 0.2s, background 0.2s, color 0.2s;
  display: flex;
  align-items: center;
}
.cart-container {
  position: relative;
  overflow: hidden;
}

.cart-link {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #333;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-width: 85px;
  height: 40px;
}

.cart-text {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.3s ease;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  opacity: 1;
}

.cart-link:hover .cart-text {
  transform: translateX(-150%);
  opacity: 0;
}

.cart-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(150%, -50%);
  transition: all 0.3s ease;
  min-width: 100%;
  height: 100%;
  opacity: 0;
  gap: 8px;
}

.cart-link:hover .cart-icon-wrapper {
  transform: translate(-50%, -50%);
  opacity: 1;
}

.cart-icon {
  font-size: 24px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-count {
  background: #e31e24;
  color: white;
  font-size: 12px;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid #fff;
  position: static;
  transform: none;
}

.header__main {
  padding: 12px 0;
}

.header__main-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header__logo img {
  align-items: center;
  margin-top: 7px;
  height: 60px;
}

.header__menu {
  display: flex;
  gap: 30px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.header__menu a {
  color: #333;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
}

.header__menu-item-has-children {
  position: relative;
}

.header__submenu {
  position: absolute;
  top: 100%;
  left: 0;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 10px 0;
  min-width: 250px;
  display: none;
}

.header__menu-item-has-children:hover .header__submenu {
  display: block;
}

.header__submenu li {
  list-style: none;
}

.header__submenu a {
  display: block;
  padding: 8px 20px;
  font-size: 14px;
}

.header__submenu a:hover {
  background: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.burger-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 1200;
  padding: 0;
  transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.burger-line {
  position: absolute;
  left: 6px;
  right: 6px;
  height: 2.5px;
  background-color: rgba(51,51,51,0.85);
  border-radius: 6px;
  box-shadow: 0 1.5px 6px rgba(227,30,36,0.08);
  transition: all 0.38s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
}
.burger-line:nth-child(1) {
  top: 6px;
}
.burger-line:nth-child(2) {
  top: 50%;
  transform: translateY(-50%);
}
.burger-line:nth-child(3) {
  bottom: 6px;
}

.burger-btn.is-active {
  box-shadow: 0 2px 16px rgba(227,30,36,0.13);
}
.burger-btn.is-active .burger-line {
  background-color: #e31e24;
  box-shadow: 0 2px 8px rgba(227,30,36,0.18);
}
.burger-btn.is-active .burger-line:nth-child(1) {
  transform: translateY(12px) scaleX(0.95) rotate(45deg);
}
.burger-btn.is-active .burger-line:nth-child(2) {
  opacity: 0;
  transform: scaleX(0.5);
}
.burger-btn.is-active .burger-line:nth-child(3) {
  transform: translateY(-12px) scaleX(0.95) rotate(-45deg);
}

.mobile-nav {
  position: fixed;
  top: 0;
  right: 0;
  width: 85%;
  max-width: 400px;
  height: 100vh;
  background: #fff;
  box-shadow: -2px 0 8px rgba(0,0,0,0.1);
  z-index: 1200;
  display: flex;
  flex-direction: column;
  transform: translateX(0);
}

.mobile-nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.mobile-nav-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.mobile-menu {
  list-style: none;
  margin: 0;
  padding: 20px 0;
  overflow-y: auto;
}

.mobile-menu-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  color: #333;
  text-decoration: none;
  font-size: 1rem;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.mobile-menu-item:hover {
  background: #f8f8f8;
  border-left-color: #e31e24;
}

.menu-icon {
  margin-right: 12px;
  font-size: 1.2rem;
}

.cart-badge {
  margin-left: auto;
  background: #e31e24;
  color: white;
  font-size: 0.8rem;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}

/* Анимации */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  z-index: 1100;
  backdrop-filter: blur(2px);
}

/* Стилизация скроллбара в мобильном меню */
.mobile-menu::-webkit-scrollbar {
  width: 4px;
}

.mobile-menu::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.mobile-menu::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 2px;
}

.mobile-menu::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* Стили для мобильной версии верхней секции */
@media (max-width: 768px) {
  .header__top-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 10px;
  }

  .mobile-search {
    flex: 5;
    width: 83.33%; /* 5/6 от ширины */
  }

  .mobile-search .search-container {
    width: 100%;
  }

  .search-input-wrapper {
    position: relative;
    width: 100%;
  }

  .search-input {
    width: 100%;
    padding: 6px 32px 6px 12px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    font-size: 13px;
    height: 32px;
  }

  .search-icon {
    position: absolute;
    right: 10px;
    top: 55%;
    transform: translateY(-50%);
    color: #666;
    font-size: 14px;
    pointer-events: none;
  }

  .mobile-cart-icon {
    flex: 1;
    width: 16.67%; /* 1/6 от ширины */
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    text-decoration: none;
    color: #333;
  }

  .search-results {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-height: calc(100vh - 60px);
    overflow-y: auto;
    z-index: 1000;
    padding: 10px;
  }

  /* Удаляем затемнение из поиска */
  .search-results::before {
    display: none;
  }

  .search-result-item {
    padding: 12px;
    border-bottom: 1px solid #eee;
  }

  .product-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .product-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .product-name {
    font-size: 14px;
    color: #333;
    font-weight: 500;
    flex: 1;
  }

  .product-price {
    font-size: 14px;
    font-weight: 500;
    color: #e31e24;
    white-space: nowrap;
  }

  .product-specs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .product-spec {
    background: #f5f5f5;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    color: #666;
  }

  .no-results {
    padding: 20px;
    text-align: center;
    color: #666;
    font-size: 14px;
  }

  /* Стилизация скроллбара для мобильных устройств */
  .search-results::-webkit-scrollbar {
    width: 4px;
  }

  .search-results::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  .search-results::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 2px;
  }

  .search-results::-webkit-scrollbar-thumb:hover {
    background: #999;
  }
}

/* Стили для поиска на десктопе */
.search-container {
  position: relative;
  width: 300px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}
.burger-line {
  width: 100%;
  height: 2px;
  background-color: #333;
  transition: all 0.3s ease;
  transform-origin: left;
}

.burger-btn.is-active .burger-line:nth-child(1) {
  transform: rotate(45deg);
}

.burger-btn.is-active .burger-line:nth-child(2) {
  opacity: 0;
}

.burger-btn.is-active .burger-line:nth-child(3) {
  transform: rotate(-45deg);
}
.search-input {
  width: 100%;
  padding: 6px 32px 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  transition: all 0.3s ease;
  background: white;
  height: 28px;
}

.search-icon {
  position: absolute;
  right: 10px;
  top: 57%;
  transform: translateY(-50%);
  color: #666;
  font-size: 14px;
  pointer-events: none;
  z-index: 1;
}

.search-input:focus {
  border-color: #e31e24;
  box-shadow: 0 0 0 2px rgba(227, 30, 36, 0.1);
  outline: none;
}

/* Стили для выпадающего списка */
.search-results {
  position: absolute;
  top: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  width: 400px;
}

.search-results-list {
  padding: 8px;
}

.search-result-item {
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f8f8;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }
}

.product-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.product-image {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f5f5;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.product-details {
  flex: 1;
  min-width: 0; /* Для корректной работы text-overflow */
}

.product-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 4px;
}

.product-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  font-size: 15px;
  font-weight: 600;
  color: #e31e24;
  white-space: nowrap;
}

.product-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.product-spec {
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;

  .spec-icon {
    font-size: 14px;
  }
}

.no-results {
  padding: 16px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

/* Стилизация скроллбара для десктопа */
.search-results::-webkit-scrollbar {
  width: 6px;
}

.search-results::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.search-results::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.search-results::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* Медиа-запрос для мобильных устройств */
@media (max-width: 768px) {
  .search-results {
    width: 100%;
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    transform: none;
    max-height: calc(100vh - 60px);
  }

  .product-image {
    width: 50px;
    height: 50px;
  }

  .product-name {
    font-size: 13px;
  }

  .product-price {
    font-size: 14px;
  }

  .product-spec {
    font-size: 11px;
    padding: 3px 6px;
  }
}

.mobile-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-search-btn, .burger-btn {
  width: 44px;
  height: 44px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: #333;
}

.mobile-search-btn {
  font-size: 22px;
}

.mobile-search-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #fff;
  z-index: 2000;
  display: flex;
  flex-direction: column;
}

.mobile-search-header {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.mobile-search-bar {
  position: relative;
  flex-grow: 1;
}

.mobile-search-modal .search-input {
  width: 100%;
  padding: 10px 40px 10px 14px;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  background: #f9f9f9;
  height: 44px;
}

.mobile-search-modal .search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #e31e24;
  font-size: 22px;
  pointer-events: none;
}

.mobile-search-modal .close-btn {
  background: none;
  border: none;
  font-size: 32px;
  color: #888;
  cursor: pointer;
  padding: 0 12px 0 0;
}

.search-results-mobile {
  flex-grow: 1;
  overflow-y: auto;
  padding: 8px;
}

.search-results-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-result-item {
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(227,30,36,0.07);
  padding: 16px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: box-shadow 0.2s, background 0.2s;
  cursor: pointer;
  border: 1.5px solid transparent;
}

.search-result-item:hover {
  background: #f9f9f9;
  box-shadow: 0 4px 16px rgba(227,30,36,0.13);
  border-color: #e31e24;
}

.search-result-item .product-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 14px;
  width: 100%;
}

.search-result-item .product-image {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
  flex-shrink: 0;
}

.search-result-item .product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.search-result-item .product-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.search-result-item .product-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 10px;
}

.search-result-item .product-name {
  font-size: 17px;
  font-weight: 700;
  color: #222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-result-item .product-price {
  font-size: 17px;
  font-weight: 700;
  color: #e31e24;
  white-space: nowrap;
  margin-left: 8px;
}

.search-result-item .product-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.search-result-item .product-spec {
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}
.burger {
  position: relative;
  width: 40px;
  height: 30px;
  background: transparent;
  cursor: pointer;
  display: block;
}

.burger input {
  display: none;
}

.burger span {
  display: block;
  position: absolute;
  height: 4px;
  width: 80%;
  background: black;
  border-radius: 9px;
  opacity: 1;
  left: 0;
  transform: rotate(0deg);
  transition: .25s ease-in-out;
}

.burger span:nth-of-type(1) {
  top: 0px;
  transform-origin: left center;
}

.burger span:nth-of-type(2) {
  top: 50%;
  transform: translateY(-50%);
  transform-origin: left center;
}

.burger span:nth-of-type(3) {
  top: 100%;
  transform-origin: left center;
  transform: translateY(-100%);
}


</style>