<template>
  <section class="admin-section container">
    <!-- Вкладки -->
    <div class="admin-tabs">
      <button :class="{active: adminTab==='catalog'}" @click="adminTab='catalog'">Каталог</button>
      <button :class="{active: adminTab==='stats'}" @click="adminTab='stats'">Статистика</button>
    </div>

    <!-- Каталог -->
    <div v-if="adminTab==='catalog'">
      <!-- Вход в админ-панель -->
      <div v-if="!authorized" class="login-box">
        <h2>Вход в админ-панель</h2>
        <input
          v-model="password"
          type="password"
          placeholder="Пароль"
          @keyup.enter="login"
        />
        <button class="btn btn-primary" @click="login">
          Войти
        </button>
        <p v-if="loginError" class="error">{{ loginError }}</p>
      </div>

      <!-- Управление каталогом -->
      <div v-else class="catalog-manager">
        <h1>Управление каталогом</h1>

        <!-- Форма добавления нового товара -->
        <div class="add-form">
          <div class="category-select">
            <label>Категория:</label>
            <div class="category-input">
              <select v-model="newProd.category">
                <option value="">Выберите категорию</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.name">
                  {{ cat.name }}
                </option>
                <option value="new">+ Добавить новую категорию</option>
              </select>
              <input
                v-if="newProd.category === 'new'"
                v-model="newCategory"
                placeholder="Название новой категории"
                @input="validateNewCategory"
              />
            </div>
          </div>

          <input
            v-model="newProd.name"
            placeholder="Название"
          />
          <textarea
            v-model="newProd.description"
            placeholder="Краткое описание"
          ></textarea>
          <textarea
            v-model="newProd.extendedDescription"
            placeholder="Расширенное описание"
          ></textarea>
          <input
            v-model.number="newProd.price"
            type="number"
            placeholder="Цена"
          />

          <label>Изображение:</label>
          <div class="image-upload">
            <select v-model="newProd.image" class="image-select">
              <option value="">Выберите изображение</option>
              <option
                v-for="img in presetImages"
                :key="img"
                :value="img"
              >
                {{ img.split('/').pop() }}
              </option>
              <option value="custom">Загрузить своё изображение</option>
            </select>
            <input
              v-if="newProd.image === 'custom'"
              type="file"
              accept="image/*"
              @change="(e: any) => handleImageUpload(e, newProd)"
              class="image-input"
            />
          </div>
          <img
            v-if="newProd.image && newProd.image !== 'custom'"
            :src="newProd.image"
            class="img-preview"
          />

          <h4>Дополнительные изображения</h4>
          <input type="file" multiple accept="image/*" @change="handleGalleryUpload" />
          <div class="gallery-previews">
            <div v-for="(gimg, gidx) in newProdGallery" :key="gidx" class="gallery-item">
              <img :src="gimg" class="img-preview" />
              <button class="btn btn-danger btn-sm" @click.prevent="removeGalleryImage(gidx)">✕</button>
            </div>
          </div>

          <h3>Характеристики</h3>
          <div class="filter-group">
            <label>Мощность</label>
            <div class="power-input-group">
              <input type="number" v-model.number="newProdPowerValue" placeholder="Число" />
              <select v-model="newProdPowerUnit">
                <option value="">Ед. изм.</option>
                <option v-for="unit in powerUnits" :key="unit" :value="unit">{{ unit }}</option>
              </select>
            </div>
          </div>
          <div class="filter-group">
            <label>Топливо</label>
            <div class="fuel-dropdown-container">
              <div class="fuel-dropdown-header" @click="toggleNewProdFuelDropdown">
                {{ newProdSelectedFuels.length === 0 ? 'Выберите топливо' : newProdSelectedFuels.join(', ') }}
              </div>
              <div v-if="showNewProdFuelDropdown" class="fuel-dropdown-content">
                <div v-for="fuelOption in availableFuels" :key="fuelOption" class="fuel-option">
                  <input type="checkbox" :id="'new-fuel-' + fuelOption.replace(/\s/g, '-') + '-add'" :value="fuelOption" v-model="newProdSelectedFuels" />
                  <label :for="'new-fuel-' + fuelOption.replace(/\s/g, '-') + '-add'">{{ fuelOption }}</label>
                </div>
              </div>
            </div>
          </div>
          <table class="specs-table">
            <tbody>
            <tr
              v-for="(spec, idx) in newSpecs"
              :key="idx"
            >
              <td>
                <input
                  v-model="spec.key"
                  placeholder="Параметр"
                />
              </td>
              <td>
                <input
                  v-model="spec.value"
                  placeholder="Значение"
                />
              </td>
              <td>
                <button
                  class="btn btn-danger btn-sm"
                  @click.prevent="removeNewSpec(idx)"
                >✕</button>
              </td>
            </tr>
            <tr>
              <td>
                <input
                  v-model="newSpec.key"
                  placeholder="Новая характеристика"
                />
              </td>
              <td>
                <input
                  v-model="newSpec.value"
                  placeholder="Значение"
                />
              </td>
              <td>
                <button
                  class="btn btn-secondary btn-sm"
                  @click.prevent="addNewSpec"
                >Добавить</button>
              </td>
            </tr>
          </tbody>
          </table>

          <button
            class="btn btn-secondary"
            @click="addProduct"
            :disabled="!isFormValid"
          >
            Добавить товар
          </button>
        </div>

        <!-- Список товаров с аккордеоном -->
        <div class="prod-list">
          <div
            v-for="p in products"
            :key="p.id"
            class="prod-item"
          >
            <!-- Сводная строка -->
            <div
              class="prod-summary"
              @click="toggle(p.id)"
            >
              <span class="prod-summary__id">{{ p.id }}</span>
              <span class="prod-summary__category">{{ p.category }}</span>
              <span class="prod-summary__name">{{ p.name }}</span>
              <span class="prod-summary__price">{{ p.price }} ₽</span>
              <button
                class="btn btn-danger btn-sm prod-summary__delete"
                @click.stop="deleteProduct(p.id)"
              >✕</button>
            </div>

            <!-- Детальная форма редактирования -->
            <transition name="slide">
              <div
                v-if="activeId === p.id"
                class="prod-details"
              >
                <label>
                  Категория:
                  <select v-model="p.category">
                    <option v-for="cat in categories" :key="cat.id" :value="cat.name">
                      {{ cat.name }}
                    </option>
                  </select>
                </label>
                <label>
                  Название:
                  <input v-model="p.name" />
                </label>
                <label>
                  Краткое описание:
                  <textarea v-model="p.description" rows="2"></textarea>
                </label>
                <label>
                  Расширенное описание:
                  <textarea v-model="p.extendedDescription" rows="3"></textarea>
                </label>
                <label>
                  Цена:
                  <input type="number" v-model.number="p.price" />
                </label>

                <label>Изображение:</label>
                <div class="image-upload">
                  <select v-model="p.image" class="image-select">
                    <option value="">Выберите изображение</option>
                    <option
                      v-for="img in presetImages"
                      :key="img"
                      :value="img"
                    >
                      {{ img.split('/').pop() }}
                    </option>
                    <option value="custom">Загрузить своё изображение</option>
                  </select>
                  <input
                    v-if="p.image === 'custom'"
                    type="file"
                    accept="image/*"
                    @change="(e: any) => handleImageUpload(e, p)"
                    class="image-input"
                  />
                </div>
                <img
                  v-if="p.image && p.image !== 'custom'"
                  :src="p.image"
                  class="img-preview"
                />

                <h3>Характеристики</h3>
                <div class="filter-group">
                  <label>Мощность</label>
                  <div class="power-input-group">
                    <input type="number" v-model.number="editProdPowerValue" placeholder="Число" />
                    <select v-model="editProdPowerUnit">
                      <option value="">Ед. изм.</option>
                      <option v-for="unit in powerUnits" :key="unit" :value="unit">{{ unit }}</option>
                    </select>
                  </div>
                </div>
                <div class="filter-group">
                  <label>Топливо</label>
                  <div class="fuel-dropdown-container">
                    <div class="fuel-dropdown-header" @click="toggleEditProdFuelDropdown">
                      {{ editProdSelectedFuels.length === 0 ? 'Выберите топливо' : editProdSelectedFuels.join(', ') }}
                    </div>
                    <div v-if="showEditProdFuelDropdown" class="fuel-dropdown-content">
                      <div v-for="fuelOption in availableFuels" :key="fuelOption" class="fuel-option">
                        <input type="checkbox" :id="'fuel-' + fuelOption.replace(/\s/g, '-') + '-' + p.id" :value="fuelOption" v-model="editProdSelectedFuels" />
                        <label :for="'fuel-' + fuelOption.replace(/\s/g, '-') + '-' + p.id">{{ fuelOption }}</label>
                      </div>
                    </div>
                  </div>
                </div>
                <table class="specs-table">
                  <tbody>
                  <tr
                    v-for="(spec, idx) in specsList[p.id].filter(s => s.key !== 'power' && s.key !== 'fuel' && s.key !== 'images')"
                    :key="idx"
                  >
                    <td>
                      <input
                        v-model="spec.key"
                        placeholder="Параметр"
                      />
                    </td>
                    <td>
                      <input
                        v-model="spec.value"
                        placeholder="Значение"
                      />
                    </td>
                    <td>
                      <button
                        class="btn btn-danger btn-sm"
                        @click.prevent="removeSpec(p.id, idx)"
                      >✕</button>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="3">
                      <button
                        class="btn btn-secondary btn-sm"
                        @click.prevent="addSpec(p.id)"
                      >Добавить характеристику</button>
                    </td>
                  </tr>
                  </tbody>
                </table>

                <h4>Дополнительные изображения</h4>
                <input type="file" multiple accept="image/*" @change="e => handleEditGalleryUpload(e, p)" />
                <div class="gallery-previews">
                  <div v-for="(gimg, gidx) in (p.specs?.images || [])" :key="gidx" class="gallery-item">
                    <img :src="gimg" class="img-preview" />
                    <button class="btn btn-danger btn-sm" @click.prevent="removeEditGalleryImage(p, gidx)">✕</button>
                  </div>
                </div>

                <div class="prod-details__actions">
                  <button
                    class="btn btn-primary"
                    @click="updateWithSpecs(p)"
                  >
                    Сохранить
                  </button>
                  <button
                    class="btn btn-secondary"
                    @click="cancelEdit"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>

    <!-- Статистика -->
    <div v-if="adminTab==='stats' && authorized">
      <h1>Статистика посещений и заявок</h1>
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Загрузка данных...</p>
      </div>
      <div v-else-if="error" class="error-state">
        <p class="error-message">{{ error }}</p>
        <button class="btn btn-primary" @click="fetchStats">Повторить</button>
      </div>
      <div v-else class="stats-section">
        <!-- Статистика посещений -->
        <div class="stats-overview">
          <div class="stats-card">
            <h3>Посещения сегодня</h3>
            <div class="stats-value">{{ stats.visits.today }}</div>
          </div>
          <div class="stats-card">
            <h3>За неделю</h3>
            <div class="stats-value">{{ stats.visits.week }}</div>
          </div>
          <div class="stats-card">
            <h3>За месяц</h3>
            <div class="stats-value">{{ stats.visits.month }}</div>
          </div>
          <div class="stats-card">
            <h3>Всего</h3>
            <div class="stats-value">{{ stats.visits.total }}</div>
          </div>
        </div>

        <!-- График посещений -->
        <div class="stats-chart">
          <canvas id="visitsChart"></canvas>
        </div>

        <!-- Статистика заявок -->
        <div class="stats-requests">
          <h2>Заявки</h2>
          
          <!-- Статистика по типам заявок -->
          <div class="request-stats">
            <div class="stats-card" v-for="(count, type) in stats.requests.stats" :key="type">
              <h3>{{ type === 'order' ? 'Заказы' : 'Контакты' }}</h3>
              <div class="stats-value">{{ count }}</div>
            </div>
          </div>

          <!-- Таблица заявок -->
          <div v-if="stats.requests.list.length === 0" class="no-data">
            <p>Нет данных о заявках</p>
          </div>
          <div v-else class="table-container">
            <table class="requests-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Тип</th>
                  <th>Телефон</th>
                  <th>Регион</th>
                  <th>Тип здания</th>
                  <th>Топливо</th>
                  <th>Тип мощности</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="request in stats.requests.list" 
                  :key="request.id" 
                  @click="showRequestDetails(request)" 
                  class="clickable-row"
                  style="cursor: pointer;"
                >
                  <td>{{ new Date(request.created_at).toLocaleDateString() }}</td>
                  <td>{{ request.type === 'calculation' ? 'Заказ' : 'Консультация' }}</td>
                  <td>{{ request.phone }}</td>
                  <td>{{ request.region }}</td>
                  <td>{{ request.type_building }}</td>
                  <td>{{ request.fuel_type }}</td>
                  <td>{{ request.power_type }}</td>
                  <td>{{ request.status }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно с деталями заявки -->
    <div v-if="selectedRequest" class="modal-overlay" @click="closeRequestDetails">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Детали заявки</h2>
          <button class="close-button" @click="closeRequestDetails">&times;</button>
        </div>
        <div class="modal-body">
          <div class="request-details">
            <div class="detail-row">
              <span class="detail-label">Тип:</span>
              <span class="detail-value">{{ selectedRequest.type === 'calculation' ? 'Заказ' : 'Консультация' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Телефон:</span>
              <span class="detail-value">{{ selectedRequest.phone }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Регион:</span>
              <span class="detail-value">{{ selectedRequest.region }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Тип здания:</span>
              <span class="detail-value">{{ selectedRequest.type_building }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Топливо:</span>
              <span class="detail-value">{{ selectedRequest.fuel_type }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Мощность:</span>
              <span class="detail-value">{{ selectedRequest.power_type }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Статус:</span>
              <span class="detail-value">{{ selectedRequest.status }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Дата:</span>
              <span class="detail-value">{{ new Date(selectedRequest.created_at).toLocaleString() }}</span>
            </div>
            <div class="detail-row full-width">
              <span class="detail-label">Текст заявки:</span>
              <div class="detail-value text-content">{{ selectedRequest.raw_text }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { createClient } from '@supabase/supabase-js'
import Chart from 'chart.js/auto'
import { useStats } from '~/composables/useStats'

// Добавляем объявление переменной chart
let chart: Chart | null = null

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

interface Category {
  id: number
  title: string
  slug: string
  image: string
  description: string
}

interface AdminCategory {
  id: number
  name: string
  slug: string
}

interface Spec {
  key: string
  value: string
}

interface Product {
  id: number
  name: string
  description: string
  extendedDescription?: string
  price: number
  image: string
  category: string
  slug: string
  specs?: Record<string, any>
}

interface Request {
  id: number
  type: string
  phone: string
  region?: string
  type_building?: string
  fuel_type?: string
  power_type?: string
  status: string
  raw_text?: string
  created_at: string
}

interface Stats {
  visits: {
    today: number
    week: number
    month: number
    total: number
  }
  requests: {
    list: Request[]
    stats: Record<string, number>
  }
}

const config = useRuntimeConfig()
const password = ref('')
const loginError = ref<string | null>(null)
const authorized = ref(false)
const products = ref<Product[]>([])
const categories = ref<AdminCategory[]>([])
const specsList = ref<Record<number, {key: string, value: string}[]>>({})
const newProd = ref<Partial<Product>>({
  name: '',
  description: '',
  extendedDescription: '',
  price: 0,
  image: '',
  category: ''
})
const newCategory = ref('')
const activeId = ref<number|null>(null)

// Характеристики
const newSpecs = ref<Spec[]>([])
const newSpec = ref<Spec>({ key:'', value:'' })

// Новые реактивные переменные для мощности и топлива
const newProdPowerValue = ref(0)
const newProdPowerUnit = ref('')
const newProdSelectedFuels = ref<string[]>([])
const showNewProdFuelDropdown = ref(false)

// Новые реактивные переменные для редактирования
const editProdPowerValue = ref(0)
const editProdPowerUnit = ref('')
const editProdSelectedFuels = ref<string[]>([])
const showEditProdFuelDropdown = ref(false)

// Доступные единицы измерения мощности
const powerUnits = ['МВт', 'кВт', 'Гкал/ч']

// Доступные виды топлива
const availableFuels = ['Природный газ', 'Дизельное топливо', 'Мазут', 'Уголь', 'Биомасса', 'Электричество']

// Предзаготовленные картинки
const presetImages = [
  '/images/cutouts/kotel1.png',
  '/images/cutouts/kotel2.png',
  '/images/cutouts/kotel3.png'
]

// add after newProdSelectedFuels definitions
const newProdGallery = ref<string[]>([])

// Move product and category loading to top-level script setup
const { data: fetchedProducts, error: productsFetchError, refresh: refreshProducts } = await useFetch<any>('/api/products', {
  query: {
    categorySlug: 'all'
  },
  transform: (response) => {
    if (!response || !response.products || !Array.isArray(response.products)) {
      console.error('Invalid response format:', response)
      return []
    }
    return response.products
  }
})

if (fetchedProducts.value) {
  products.value = fetchedProducts.value.map((product: Product) => {
    const powerMatch = product.specs?.power?.match(/^(\d+(\.\d+)?)\s*(.*)$/)
    const powerValue = powerMatch ? parseFloat(powerMatch[1]) : 0
    const powerUnit = powerMatch ? powerMatch[3] : ''
    
    let fuel: string[] = []
    if (product.specs?.fuel) {
      if (Array.isArray(product.specs.fuel)) {
        fuel = product.specs.fuel.filter((f: string) => f !== 'отсутствует')
      } else if (typeof product.specs.fuel === 'string') {
        fuel = (product.specs.fuel as string).split(', ').map((f: string) => f.trim()).filter((f: string) => f !== 'отсутствует')
      }
    }
    
    return {
      ...product,
      slug: generateSlug(product.name || ''),
      specs: {
        ...product.specs,
        power: powerValue,
        powerUnit: powerUnit,
        fuel: fuel,
      }
    }
  })
}

const { data: fetchedCategories, error: categoriesFetchError } = await useFetch<Category[]>('/api/categories')

if (fetchedCategories.value) {
  categories.value = fetchedCategories.value.map(cat => ({
    id: cat.id,
    name: cat.title,
    slug: cat.slug
  })) as AdminCategory[]
}

if (productsFetchError.value) {
  console.error('Error fetching products for admin:', productsFetchError.value)
  products.value = []
}

if (categoriesFetchError.value) {
  console.error('Error fetching categories for admin:', categoriesFetchError.value)
  categories.value = []
}

// Update specsList after products are loaded
watch(products, (newProducts) => {
  if (Array.isArray(newProducts)) {
    newProducts.forEach(p => {
      specsList.value[p.id] = Object.entries(p.specs || {}).map(([k,v]) => ({key: k, value: String(v)}))
    })
  }
}, { immediate: true })

// Валидация формы
const isFormValid = computed(() => {
  const baseValid = newProd.value.name && 
         newProd.value.description && 
         typeof newProd.value.price === 'number' && newProd.value.price > 0 && 
         newProd.value.category && 
         (newProd.value.category !== 'new' || (newCategory.value && !categories.value.some(c => c.name === newCategory.value)))

  const powerValid = !(newProdPowerValue.value > 0 && !newProdPowerUnit.value)

  return baseValid && powerValid
})

function validateNewCategory() {
  if (newCategory.value && categories.value.some(c => c.name === newCategory.value)) {
    newProd.value.category = newCategory.value
    newCategory.value = ''
  }
}

// Добавляем функцию generateSlug в начало скрипта после импортов
function generateSlug(text: string): string {
  return transliterate(text)
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// Обновляем функцию addProduct
async function addProduct() {
  try {
    // Проверяем обязательные поля
    if (!newProd.value.name || !newProd.value.category) {
      console.error('Name and category are required')
      return
    }

    // Определяем категорию и её slug
    let categoryName = newProd.value.category
    let categorySlug = ''

    if (categoryName === 'new') {
      if (!newCategory.value) {
        console.error('New category name is required')
        return
      }
      categoryName = newCategory.value
      categorySlug = generateSlug(categoryName)

      try {
        // Добавляем новую категорию
        const categoryResponse = await $fetch('/api/categories', {
          method: 'POST',
          body: {
            title: categoryName,
            slug: categorySlug
          }
        })

        if (!categoryResponse) {
          console.error('Failed to create category')
          return
        }

        // Обновляем список категорий
        const categoriesResponse = await $fetch('/api/categories')
        if (Array.isArray(categoriesResponse)) {
          categories.value = categoriesResponse.map(cat => ({
            id: cat.id,
            name: cat.title,
            slug: cat.slug
          }))
        }
      } catch (error) {
        console.error('Error creating category:', error)
        return
      }
    } else {
      // Находим существующую категорию
      const existingCategory = categories.value.find(c => c.name === categoryName)
      if (!existingCategory) {
        console.error('Category not found:', categoryName)
        return
      }
      categorySlug = existingCategory.slug
    }

    // Подготовка данных для отправки
    const productData = {
      title: newProd.value.name.trim(),
      description: (newProd.value.description || '').trim(),
      extended_description: (newProd.value.extendedDescription || '').trim(),
      price: Number(newProd.value.price) || 0,
      image: newProd.value.image || '/placeholder.jpg',
      category: categoryName,
      category_slug: categorySlug,
      slug: generateSlug(newProd.value.name),
      specs: {
        power: newProdPowerValue.value > 0 ? `${newProdPowerValue.value} ${newProdPowerUnit.value}` : 'отсутствует',
        fuel: newProdSelectedFuels.value.length > 0 ? newProdSelectedFuels.value.join(', ') : 'отсутствует',
        ...Object.fromEntries(newSpecs.value
          .filter(spec => spec.key && spec.value)
          .map(spec => [spec.key.trim(), spec.value.trim()])),
        images: newProdGallery.value,
      }
    }

    console.log('Sending product data:', JSON.stringify(productData, null, 2))

    try {
      // Отправка запроса на создание товара
      const response = await $fetch('/api/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      })

      console.log('Server response:', response)

      // Привет нулевые
      /**
       * Сейчас так никто не пишет. Все юзают вот это:
       * 
       * $fetrh(url, {})
       * .then((response) => {
       *    обработка ответа
       * })
       * .catch((error) => {
       *    обработка ошибок
       * })
       * .finally(() => {
       *    выполнение кода как для ошибки, так и для успеха
       * })
       * 
       */
      if (!response) {
        console.error('Failed to create product')
        return
      }

      // Обновление списка товаров
      const refreshedProducts = await $fetch('/api/products', {
        query: {
          categorySlug: 'all'
        }
      })

      if (refreshedProducts && refreshedProducts.products) {
        products.value = refreshedProducts.products.map(product => {
          const powerMatch = product.specs?.power?.match(/^(\d+(\.\d+)?)\s*(.*)$/)
          const powerValue = powerMatch ? parseFloat(powerMatch[1]) : 0
          const powerUnit = powerMatch ? powerMatch[3] : ''
          
          let fuel: string[] = []
          if (product.specs?.fuel) {
            if (Array.isArray(product.specs.fuel)) {
              fuel = product.specs.fuel.filter((f: string) => f !== 'отсутствует')
            } else if (typeof product.specs.fuel === 'string') {
              fuel = (product.specs.fuel as string).split(', ').map((f: string) => f.trim()).filter((f: string) => f !== 'отсутствует')
            }
          }
          
          return {
            ...product,
            slug: generateSlug(product.name),
            specs: {
              ...product.specs,
              power: powerValue,
              powerUnit: powerUnit,
              fuel: fuel,
            }
          }
        })
      }

      // Очистка формы
      newProd.value = {
        name: '',
        description: '',
        extendedDescription: '',
        price: 0,
        image: '',
        category: ''
      }
      newCategory.value = ''
      newSpecs.value = []
      newSpec.value = { key: '', value: '' }
      newProdPowerValue.value = 0
      newProdPowerUnit.value = ''
      newProdSelectedFuels.value = []
      newProdGallery.value = []

    } catch (error: unknown) {
      console.error('Error creating product:', error)
      if (error && typeof error === 'object' && 'response' in error) {
        console.error('Error response:', error.response)
      }
    }

  } catch (error) {
    console.error('Error creating product:', error)
    if (error && typeof error === 'object' && 'response' in error) {
      console.error('Error response:', error.response)
    }
  }
}

function toggle(id:number) {
  activeId.value = activeId.value === id ? null : id
  if (activeId.value === id) {
    const productToEdit = products.value.find(p => p.id === id)
    if (productToEdit) {
      // Инициализируем значения для редактирования мощности
      const powerValue = productToEdit.specs?.power
      if (typeof powerValue === 'string' && powerValue !== 'отсутствует') {
        const powerMatch = powerValue.match(/^(\d+(\.\d+)?)\s*(.*)$/)
        if (powerMatch) {
          editProdPowerValue.value = parseFloat(powerMatch[1])
          editProdPowerUnit.value = powerMatch[3]
        } else {
          editProdPowerValue.value = 0
          editProdPowerUnit.value = ''
        }
      } else {
        editProdPowerValue.value = 0
        editProdPowerUnit.value = ''
      }

      // Инициализируем значения для редактирования топлива
      if (productToEdit.specs?.fuel) {
        if (Array.isArray(productToEdit.specs.fuel)) {
          editProdSelectedFuels.value = productToEdit.specs.fuel.filter((f: string) => f !== 'отсутствует')
        } else if (typeof productToEdit.specs.fuel === 'string') {
          editProdSelectedFuels.value = productToEdit.specs.fuel.split(', ').filter((f: string) => f !== 'отсутствует')
        } else {
          editProdSelectedFuels.value = []
        }
      } else {
        editProdSelectedFuels.value = []
      }

      // Обновляем specsList для редактируемого продукта, исключая power, powerUnit и fuel
      specsList.value[id] = Object.entries(productToEdit.specs || {})
        .filter(([key]) => !['power', 'powerUnit', 'fuel'].includes(key))
        .map(([k,v]) => ({key: k, value: String(v)}))
      
      showEditProdFuelDropdown.value = false;
    }
  } else {
    showEditProdFuelDropdown.value = false;
  }
}

// Обновляем функцию updateWithSpecs
async function updateWithSpecs(p: Product) {
  try {
    let specs: Record<string, string | string[]> = {}

    // Добавляем мощность из новых полей ввода
    let powerString = ''
    if (editProdPowerValue.value > 0 && editProdPowerUnit.value) {
      powerString = `${editProdPowerValue.value} ${editProdPowerUnit.value}`
    } else {
      powerString = 'отсутствует'
    }
    specs.power = powerString

    // Добавляем топливо из выбранных чекбоксов
    specs.fuel = editProdSelectedFuels.value.length > 0 ? editProdSelectedFuels.value.join(', ') : 'отсутствует'

    // Добавляем остальные характеристики
    specsList.value[p.id]
      .filter(s => s.key !== 'power' && s.key !== 'fuel' && s.key !== 'images')
      .forEach(s => specs[s.key] = s.value)

    // Добавляем изображения галереи, если есть
    if (p.specs && Array.isArray(p.specs.images)) {
      specs.images = p.specs.images
    }

    const categorySlug = categories.value.find(c => c.name === p.category)?.slug
    if (!categorySlug) {
      console.error('Category slug not found for category:', p.category)
      return
    }

    const updateData = { 
      ...p, 
      specs,
      category_slug: categorySlug
    }

    console.log('Sending update data:', updateData)

    await $fetch(`/api/products/${p.id}`, {
      method: 'PUT',
      body: updateData
    })

    // Обновляем список товаров после успешного обновления
    await refreshProducts()

    activeId.value = null
  } catch (error) {
    console.error('Error updating product:', error)
  }
}

function cancelEdit() {
  activeId.value = null
  // Сбрасываем значения для редактирования мощности и топлива при отмене
  editProdPowerValue.value = 0
  editProdPowerUnit.value = ''
  editProdSelectedFuels.value = []
  showEditProdFuelDropdown.value = false
}

function addSpec(id:number) {
  specsList.value[id].push({ key:'', value:'' })
}

function removeSpec(id:number, idx:number) {
  // Удаляем характеристику по индексу, но пропускаем power и fuel, так как они управляются отдельными полями
  const originalIndex = products.value.find(prod => prod.id === id)?.specs ? Object.keys(products.value.find(prod => prod.id === id)?.specs || {}).indexOf(specsList.value[id][idx].key) : -1;
  if (originalIndex !== -1 && (specsList.value[id][idx].key === 'power' || specsList.value[id][idx].key === 'fuel')) {
    // Do nothing, these are managed by separate fields
    return;
  }
  specsList.value[id].splice(idx,1)
}

function addNewSpec() {
  if (newSpec.value.key && newSpec.value.value) {
    newSpecs.value.push({ key:newSpec.value.key, value:newSpec.value.value })
    newSpec.value.key = ''
    newSpec.value.value = ''
  }
}

function removeNewSpec(idx:number) {
  newSpecs.value.splice(idx,1)
}

async function deleteProduct(id:number) {
  await $fetch(`/api/products/${id}`, { method:'DELETE' })
  products.value = products.value.filter(x=>x.id!==id)
  delete specsList.value[id]
}

async function handleImageUpload(event: Event, product: Product | Partial<Product>) {
  const input = event.target as HTMLInputElement
  if (!input.files || !input.files[0]) return

  const file = input.files[0]
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await $fetch('/api/upload/image', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })

    if (response && response.path) {
      product.image = response.path
    }
  } catch (error) {
    console.error('Error uploading image:', error)
  }
}

function toggleNewProdFuelDropdown() {
  showNewProdFuelDropdown.value = !showNewProdFuelDropdown.value;
}

function toggleEditProdFuelDropdown() {
  showEditProdFuelDropdown.value = !showEditProdFuelDropdown.value;
}

// Возвращаем оригинальную функцию входа
function login() {
  if (password.value === config.public.adminPassword) {
    authorized.value = true
  } else {
    loginError.value = 'Неправильный пароль'
  }
}

function logout() {
  authorized.value = false
  password.value = ''
  loginError.value = null
}

// Existing handleImageUpload remains. I'll add new function:
async function handleGalleryUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  const files = Array.from(input.files)
  for (const file of files) {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const response = await $fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      if (response && response.path) {
        newProdGallery.value.push(response.path)
      }
    } catch (error) {
      console.error('Error uploading gallery image:', error)
    }
  }
  // clear input value for same file re-upload capability
  input.value = ''
}

function removeGalleryImage(idx:number) {
  newProdGallery.value.splice(idx,1)
}

// Для редактирования галереи
function removeEditGalleryImage(p: Product, idx: number) {
  if (p.specs && Array.isArray(p.specs.images)) {
    p.specs.images.splice(idx, 1)
  }
}

async function handleEditGalleryUpload(event: Event, p: Product) {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  const files = Array.from(input.files)
  if (!p.specs) p.specs = {}
  if (!Array.isArray(p.specs.images)) p.specs.images = []
  for (const file of files) {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const response = await $fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })
      if (response && response.path) {
        p.specs.images.push(response.path)
      }
    } catch (error) {
      console.error('Error uploading gallery image:', error)
    }
  }
  input.value = ''
}

const adminTab = ref('catalog')

// Supabase client
const supabaseUrl = config.public.supabaseUrl
const supabaseKey = config.public.supabaseKey

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase configuration is missing')
  throw new Error('Supabase configuration is missing')
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Заменяем существующие переменные для статистики
const { visits, requests, loading, error, fetchVisits, fetchRequests } = useStats()

// Обновляем функцию renderChart
function renderChart() {
  if (!visits.value.length) return
  const ctx = document.getElementById('visitsChart') as HTMLCanvasElement
  if (!ctx) return
  if (chart) chart.destroy()
  
  // Сортируем данные по дате
  const sortedVisits = [...visits.value].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  // Получаем последние 30 дней
  const last30Days = sortedVisits.slice(-30)
  
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: last30Days.map(v => new Date(v.date).toLocaleDateString()),
      datasets: [{
        label: 'Посещения',
        data: last30Days.map(v => v.count),
        borderColor: '#007bff',
        backgroundColor: 'rgba(0,123,255,0.1)',
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Посещений: ${context.raw}`
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  })
}

// Обновляем функцию fetchStats
async function fetchStats() {
  loading.value = true
  error.value = null
  try {
    // Получаем общую статистику
    const { data: statsData } = await useFetch<Stats>('/api/stats')
    if (statsData.value) {
      stats.value = {
        visits: statsData.value.visits,
        requests: {
          list: statsData.value.requests.list,
          stats: statsData.value.requests.stats || {}
        }
      }
    }

    // Получаем данные для графика
    const { data: visitsData } = await useFetch<{ visits: { date: string; count: number; }[] }>('/api/visits')
    if (visitsData.value?.visits) {
      visits.value = visitsData.value.visits
      renderChart()
    }

    // Получаем список заявок
    const { data: requestsData } = await useFetch<{ requests: Request[] }>('/api/requests')
    if (requestsData.value?.requests) {
      // Группируем заявки по типу для статистики
      const requestStats = requestsData.value.requests.reduce((acc: Record<string, number>, req) => {
        acc[req.type] = (acc[req.type] || 0) + 1
        return acc
      }, {})

      stats.value = {
        ...stats.value,
        requests: {
          list: requestsData.value.requests,
          stats: requestStats
        }
      }
    }
  } catch (e) {
    error.value = 'Failed to fetch statistics'
    console.error('Error fetching statistics:', e)
  } finally {
    loading.value = false
  }
}

// Добавляем функцию для получения данных о посещениях
async function fetchVisitsData(): Promise<{ date: string; count: number; }[]> {
  try {
    const { data } = await useFetch<{ visits: { date: string; count: number; }[] }>('/api/visits')
    return data.value?.visits || []
  } catch (e) {
    console.error('Error fetching visits data:', e)
    return []
  }
}

// Обновляем watch для adminTab
watch(adminTab, (tab) => {
  if (tab === 'stats' && authorized.value) {
    fetchStats()
  }
})

// Обновляем onMounted
onMounted(() => {
  if (adminTab.value === 'stats' && authorized.value) {
    fetchStats()
  }
})

// Обновляем состояние для статистики
const stats = ref<Stats>({
  visits: {
    today: 0,
    week: 0,
    month: 0,
    total: 0
  },
  requests: {
    list: [],
    stats: {}
  }
})

const selectedRequest = ref<Request | null>(null)

const showRequestDetails = (request: Request) => {
  console.log('Opening request details:', request)
  selectedRequest.value = request
}

const closeRequestDetails = () => {
  console.log('Closing request details')
  selectedRequest.value = null
}
</script>

<style lang="scss" scoped>
.admin-section {
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 2rem;
  }

  .login-box {
    max-width: 400px;
    margin: 2rem auto;
    padding: 1.5rem;
    background: var(--bg);
    border-radius: 0.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .login-box h2 {
    margin-bottom: 1.5rem;
    text-align: center;
    font-size: 1.5rem;
    color: var(--text);
  }

  .login-box input {
    width: 100%;
    padding: 0.75rem;
    margin-bottom: 1rem;
    border: 1px solid var(--secondary);
    border-radius: 0.5rem;
    font-size: 0.95rem;
  }

  @media (min-width: 768px) {
    .login-box input {
      font-size: 1rem;
    }
  }

  .login-box button {
    width: 100%;
    padding: 0.75rem;
    font-size: 0.95rem;
  }

  @media (min-width: 768px) {
    .login-box button {
      font-size: 1rem;
    }
  }

  .login-box .error {
    color: #dc3545;
    margin-top: 1rem;
    text-align: center;
    font-size: 0.9rem;
  }

  .catalog-manager {
    h1 {
      font-size: 1.5rem;
      margin-bottom: 2rem;
      text-align: center;
      color: var(--text);

      @media (min-width: 768px) {
        font-size: 2rem;
      }
    }
  }

  .add-form {
    background: var(--bg);
    padding: 1.5rem;
    border-radius: 0.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);

    .category-select {
      margin-bottom: 1rem;

      .category-input {
        display: flex;
        gap: 1rem;
        align-items: center;

        select, input {
          flex: 1;
        }
      }
    }

    .filter-group {
      margin-bottom: 1rem;
      
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        font-size: 0.95rem;

        @media (min-width: 768px) {
          font-size: 1rem;
        }
      }

      input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--secondary);
        border-radius: 0.5rem;
        font-size: 0.95rem;
        background: var(--bg);

        @media (min-width: 768px) {
          font-size: 1rem;
        }
      }
    }

    input, textarea, select {
      width: 100%;
      padding: 0.75rem;
      margin-bottom: 1rem;
      border: 1px solid var(--secondary);
      border-radius: 0.5rem;
      font-size: 0.95rem;
      background: var(--bg);

      @media (min-width: 768px) {
        font-size: 1rem;
      }
    }

    textarea {
      min-height: 100px;
      resize: vertical;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      font-size: 0.95rem;

      @media (min-width: 768px) {
        font-size: 1rem;
      }
    }

    h3 {
      font-size: 1.2rem;
      margin: 1.5rem 0 1rem;
      color: var(--text);
    }

    .img-preview {
      max-width: 200px;
      height: auto;
      margin: 1rem 0;
      border-radius: 0.25rem;
    }

    .gallery-previews {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 10px;
    }

    .gallery-item {
      position: relative;
    }

    .gallery-item .img-preview {
      width: 120px;
      height: auto;
    }

    .gallery-item button {
      position: absolute;
      top: 4px;
      right: 4px;
      padding: 0.25rem 0.4rem;
    }
  }

  .specs-table {
    width: 100%;
    margin-bottom: 1rem;
    border-collapse: collapse;

    td {
      padding: 0.5rem;
      vertical-align: middle;

      @media (max-width: 767px) {
        display: block;
        width: 100%;
        padding: 0.25rem 0;
      }
    }

    input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid var(--secondary);
      border-radius: 0.25rem;
      font-size: 0.9rem;
      margin-bottom: 0;

      @media (min-width: 768px) {
        font-size: 0.95rem;
      }
    }

    button {
      padding: 0.5rem;
      font-size: 0.9rem;
      margin: 0;

      @media (min-width: 768px) {
        font-size: 0.95rem;
      }
    }
  }

  .prod-list {
    .prod-item {
      background: var(--bg);
      border-radius: 0.5rem;
      margin-bottom: 1rem;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .prod-summary {
      display: flex;
      align-items: center;
      padding: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: rgba(0,0,0,0.05);
      }

      &__id {
        width: 50px;
        font-size: 0.9rem;
        color: var(--secondary);
      }

      &__category {
        width: 120px;
        font-size: 0.9rem;
        color: var(--primary);
        margin-right: 1rem;
      }

      &__name {
        flex: 1;
        font-size: 1rem;
        color: var(--text);
        margin: 0 1rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &__price {
        font-weight: 600;
        color: var(--accent);
        margin-right: 1rem;
        font-size: 0.95rem;
      }

      &__delete {
        padding: 0.5rem;
        font-size: 0.9rem;
      }
    }

    .prod-details {
      padding: 1.5rem;
      border-top: 1px solid var(--secondary);

      label {
        display: block;
        margin-bottom: 1rem;
        font-size: 0.95rem;

        @media (min-width: 768px) {
          font-size: 1rem;
        }

        input, textarea, select {
          width: 100%;
          padding: 0.75rem;
          margin-top: 0.5rem;
          border: 1px solid var(--secondary);
          border-radius: 0.5rem;
          font-size: 0.95rem;
          background: var(--bg);

          @media (min-width: 768px) {
            font-size: 1rem;
          }
        }

        textarea {
          min-height: 100px;
          resize: vertical;
        }
      }

      .img-preview {
        max-width: 200px;
        height: auto;
        margin: 1rem 0;
        border-radius: 0.25rem;
      }

      &__actions {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;

        @media (max-width: 767px) {
          flex-direction: column;
        }

        button {
          flex: 1;
          padding: 0.75rem;
          font-size: 0.95rem;

          @media (min-width: 768px) {
            font-size: 1rem;
          }
        }
      }
    }
  }
}

// Анимации
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fuel-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.fuel-option {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 0.25rem;
  transition: background-color 0.2s ease;
  width: 100%;

  &:hover {
    background-color: rgba(var(--primary-rgb), 0.1);
  }

  label {
    cursor: pointer;
    flex: 1;
    margin-bottom: 0;
    position: relative;
    padding-right: 25px;
  }

  input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    width: 0;
    height: 0;
  }

  input[type="checkbox"]:checked + label::after {
    content: '✔';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    color: var(--primary);
    font-size: 1.2em;
    display: block;
  }
}

.fuel-dropdown-container {
  position: relative;
  width: 100%;
  margin-bottom: 1rem;
}

.fuel-dropdown-header {
  border: 1px solid var(--secondary);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  background-color: var(--bg);
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--primary);
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  }

  &::after {
    content: '▼';
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.8em;
    color: var(--text-light);
    transition: transform 0.2s ease;
  }
}

.fuel-dropdown-content {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 100%;
  background-color: var(--bg);
  border: 1px solid var(--secondary);
  border-radius: 0.5rem;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  z-index: 10;
  padding: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.fuel-dropdown-content .fuel-option {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 0.25rem;
  transition: background-color 0.2s ease;
  width: 100%;

  &:hover {
    background-color: rgba(var(--primary-rgb), 0.1);
  }

  label {
    cursor: pointer;
    flex: 1;
    margin-bottom: 0;
    position: relative;
    padding-right: 25px;
  }

  input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    width: 0;
    height: 0;
  }

  input[type="checkbox"]:checked + label::after {
    content: '✔';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    color: var(--primary);
    font-size: 1.2em;
    display: block;
  }
}

.admin-tabs {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
}
.admin-tabs button {
  padding: 10px 24px;
  border: none;
  border-radius: 6px 6px 0 0;
  background: #f5f5f5;
  color: #333;
  font-size: 1.1rem;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}
.admin-tabs button.active {
  background: #fff;
  color: #007bff;
  border-bottom: 2px solid #007bff;
}
.stats-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}
.stats-chart {
  width: 100%;
  max-width: 100%;
  margin-bottom: 1rem;
}
.stats-requests {
  width: 100%;
}
.request-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}
.table-container {
  width: 100%;
  overflow-x: auto;
  margin-top: 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
}
.requests-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.requests-table th, 
.requests-table td {
  border: 1px solid #eee;
  padding: 8px;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}
.requests-table th {
  background: #f5f5f5;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 1;
}
.requests-table td {
  vertical-align: top;
}
.requests-table tr:hover {
  background-color: #f9f9f9;
}
@media (max-width: 768px) {
  .table-container {
    margin: 0 -1rem;
    border-radius: 0;
  }
  
  .requests-table th,
  .requests-table td {
    max-width: none;
  }
}
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--secondary);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  p {
    color: var(--text-light);
    font-size: 1.1rem;
  }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;

  .error-message {
    color: #dc3545;
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: var(--text-light);
  font-size: 1.1rem;
  background: var(--bg);
  border-radius: 0.5rem;
  margin-top: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stats-card {
  background: var(--bg);
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;

  h3 {
    font-size: 1rem;
    color: var(--text-light);
    margin-bottom: 0.5rem;
  }

  .stats-value {
    font-size: 2rem;
    font-weight: 600;
    color: var(--primary);
  }
}

.request-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 2fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.clickable-row {
  cursor: pointer !important;
  transition: background-color 0.2s;
}

.clickable-row:hover {
  background-color: #f0f0f0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  color: #666;
}

.modal-body {
  padding: 1rem;
}

.request-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-row {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.detail-row.full-width {
  flex-direction: column;
}

.detail-label {
  font-weight: 600;
  min-width: 120px;
  color: #666;
}

.detail-value {
  flex: 1;
}

.text-content {
  white-space: pre-wrap;
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 0.5rem;
}
</style>

