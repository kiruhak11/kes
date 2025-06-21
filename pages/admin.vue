<template>
  <section class="admin-section container">
    <!-- Вкладки -->
    <div class="admin-tabs">
      <button :class="{active: adminTab==='catalog'}" @click="adminTab='catalog'">Каталог</button>
      <button :class="{active: adminTab==='categories'}" @click="adminTab='categories'">Категории</button>
      <button :class="{active: adminTab==='stats'}" @click="adminTab='stats'">Статистика</button>
    </div>
    <AdminCatalog v-if="adminTab==='catalog'"
      :admin-tab="adminTab"
      :authorized="authorized"
      :password="password"
      :login-error="loginError"
      @update:password="val => password = val"
      @login="login"
      @logout="logout"
      :products="products"
      :categories="categories"
      :specs-list="specsList"
      :new-prod="newProd"
      :new-category="newCategory"
      :active-id="activeId"
      :new-specs="newSpecs"
      :new-spec="newSpec"
      :new-prod-power-value="newProdPowerValue"
      :new-prod-power-unit="newProdPowerUnit"
      :new-prod-selected-fuels="newProdSelectedFuels"
      :show-new-prod-fuel-dropdown="showNewProdFuelDropdown"
      :power-units="powerUnits"
      :available-fuels="availableFuels"
      :preset-images="presetImages"
      :new-prod-gallery="newProdGallery"
      :is-form-valid="!!isFormValid"
      :modal-store="modalStore"
      :filtered-specs="filteredSpecs"
      @add-product="addProduct"
      @reset-form="resetForm"
      @toggle="toggle"
      @update-with-specs="updateWithSpecs"
      @cancel-edit="cancelEdit"
      @add-spec="addSpec"
      @remove-spec="removeSpec"
      @add-new-spec="addNewSpec"
      @remove-new-spec="removeNewSpec"
      @delete-product="deleteProduct"
      @handle-image-upload="handleImageUpload"
      @handle-connection-scheme-upload="handleConnectionSchemeUpload"
      @toggle-new-prod-fuel-dropdown="toggleNewProdFuelDropdown"
      @handle-gallery-upload="handleGalleryUpload"
      @remove-gallery-image="removeGalleryImage"
      @remove-edit-gallery-image="removeEditGalleryImage"
      @handle-edit-gallery-upload="handleEditGalleryUpload"
      @update:new-category="val => newCategory = val"
      @update:new-prod-power-value="val => newProdPowerValue = val"
      @update:new-prod-power-unit="val => newProdPowerUnit = val"
      @update:new-prod-selected-fuels="val => newProdSelectedFuels = val"
      @update:new-prod="val => newProd = val"
      @update:new-spec="val => newSpec = val"
      @update:new-specs="val => newSpecs = val"
    />
    <AdminCategories v-if="adminTab==='categories' && authorized"
      :categories="categories"
      :products="products"
      :new-category="newCategory"
      :editing-category="editingCategory"
      :show-add-category-modal="showAddCategoryModal"
      :show-edit-category-modal="showEditCategoryModal"
      :modal-store="modalStore"
      @add-category="addCategory"
      @edit-category="editCategory"
      @save-category="saveCategory"
      @delete-category="deleteCategory"
      @close-edit-category-modal="closeEditCategoryModal"
      @update:new-category="val => newCategory = val"
      @update:editing-category="val => editingCategory = val"
      @update:show-add-category-modal="val => showAddCategoryModal = val"
      @update:show-edit-category-modal="val => showEditCategoryModal = val"
      :get-category-product-count="getCategoryProductCount"
    />
    <AdminStats v-if="adminTab==='stats' && authorized"
      :stats="stats"
      :loading="loading"
      :error="error || ''"
      :visits="visits"
      :requests="requests"
      :selected-request="selectedRequest"
      @fetch-stats="fetchStats"
      @show-request-details="showRequestDetails"
      @close-request-details="closeRequestDetails"
    />
  </section>
</template>

<script setup lang="ts">
import AdminCatalog from '~/components/AdminCatalog.vue'
import AdminCategories from '~/components/AdminCategories.vue'
import AdminStats from '~/components/AdminStats.vue'
import { ref, onMounted, watch, h } from 'vue'
import { createClient } from '@supabase/supabase-js'
import Chart from 'chart.js/auto'
import { useStats } from '~/composables/useStats'
import { useModalStore } from '~/stores/modal'
import { useFileStorage } from '~/composables/useFileStorage'
const { setModal, closeModal, clearModals, isOpen } = useFrogModal();
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

interface Spec {
  key: string;
  value: string;
  showKeySuggestions?: boolean;
  showValueSuggestions?: boolean;
}

interface Category {
  id: number
  title: string
  slug: string
  image: string
  description: string
}

interface AdminCategory {
  id: string
  name: string
  slug: string
  description?: string
}

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
  specs?: Record<string, any>
  additional_images?: string[]
  delivery_set?: string
  connection_scheme?: string
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
const specsList = ref<Record<number, Spec[]>>({})
const newProd = ref({
  name: '',
  description: '',
  extendedDescription: '',
  price: 0,
  image: '',
  category: '',
  delivery_set: '',
  connection_scheme: ''
})
const newCategory = ref({
  name: '',
  description: '',
  slug: ''
})
const activeId = ref<number|null>(null)

// Характеристики
const newSpecs = ref<Spec[]>([])
const newSpec = ref<Spec>({ key:'', value:'' })

// Новые реактивные переменные для мощности и топлива
const newProdPowerValue = ref()
const newProdPowerUnit = ref('')
const newProdSelectedFuels = ref([])
const showNewProdFuelDropdown = ref(false)

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
// First load categories
const { data: fetchedCategories, error: categoriesFetchError } = await useFetch<Category[]>('/api/categories')

if (fetchedCategories.value) {
  categories.value = fetchedCategories.value.map(cat => ({
    id: String(cat.id),
    name: cat.title,
    description: cat.description,
    slug: cat.slug
  }))
} else {
  console.error('No categories data received')
  categories.value = []
}

if (categoriesFetchError.value) {
  console.error('Error fetching categories for admin:', categoriesFetchError.value)
  categories.value = []
}

// Then load products
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
    // Find the category name from the category ID or slug
    const category = categories.value.find(c => 
      c.id === String(product.category_id) || 
      c.slug === product.category_slug
    )
    
    // Сохраняем дополнительные изображения
    const additionalImages = product.specs?.images || product.additional_images || []
    
    // Создаем новый объект specs без старых полей power, fuel, powerUnit
    const cleanSpecs: Record<string, any> = {}
    if (product.specs) {
      Object.entries(product.specs).forEach(([key, value]) => {
        // Исключаем старые поля, которые больше не используются
        if (!['power', 'fuel', 'powerUnit'].includes(key)) {
          cleanSpecs[key] = value
        }
      })
    }
    
    return {
      ...product,
      category: category?.name || product.category || '',
      slug: generateSlug(product.name || ''),
      specs: {
        ...cleanSpecs,
        images: additionalImages
      }
    }
  })
} else {
  console.error('No products data received')
  products.value = []
}

if (productsFetchError.value) {
  console.error('Error fetching products for admin:', productsFetchError.value)
  products.value = []
}

// Update specsList after products are loaded
watch(products, (newProducts) => {
  if (Array.isArray(newProducts)) {
    newProducts.forEach(p => {
      // Инициализируем specsList только если его еще нет для этого продукта
      if (!specsList.value[p.id]) {
        specsList.value[p.id] = Object.entries(p.specs || {})
          .filter(([key]) => key !== 'images') // Исключаем images, так как они обрабатываются отдельно
          .map(([k,v]) => ({
            key: k, 
            value: String(v),
            showKeySuggestions: false,
            showValueSuggestions: false
          }))
      }
      
      // Убеждаемся, что поле images существует в specs
      if (!p.specs) {
        p.specs = {}
      }
      if (!Array.isArray(p.specs.images)) {
        p.specs.images = []
      }
    })
  }
}, { immediate: true })

// Валидация формы
const isFormValid = computed(() => {
  const valid = newProd.value.name && 
         newProd.value.description && 
         newProd.value.price > 0 && 
         (newProd.value.category && newProd.value.category !== 'new' || (newProd.value.category === 'new' && newCategory.value.name))
  
  return valid
})

function validateNewCategory() {
  if (newCategory.value.name && categories.value.some(c => c.name === newCategory.value.name)) {
    newProd.value.category = newCategory.value.name
    newCategory.value.name = ''
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
const modalStore = useModalStore()
// Обновляем функцию addProduct
async function addProduct() {
  try {
    // Проверяем валидность формы
    if (!isFormValid.value) {
      console.error('Form validation failed')
      return
    }

    let categoryId = null
    let categorySlug = ''
    let categoryName = ''

    // Если выбрана новая категория, сначала создаем её
    if (newProd.value.category === 'new') {
      const categoryResponse = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newCategory.value.name,
          description: newCategory.value.description,
          slug: generateSlug(newCategory.value.name)
        })
      })

      if (!categoryResponse.ok) {
        const errorText = await categoryResponse.text()
        console.error('Category creation error:', errorText)
        throw new Error('Failed to create category: ' + errorText)
      }

      const categoryData = await categoryResponse.json()

      categoryId = categoryData.id
      categorySlug = categoryData.slug || generateSlug(newCategory.value.name)
      categoryName = categoryData.name || newCategory.value.name

      categories.value.push({
        id: categoryId,
        name: categoryName,
        slug: categorySlug
      })
    } else {
      // Находим существующую категорию
      const category = categories.value.find(c => c.name === newProd.value.category)
      if (!category) {
        throw new Error('Category not found')
      }
      categoryId = category.id
      categoryName = category.name
      categorySlug = category.slug
    }

    // Подготовка спецификаций
    const specs: Record<string, any> = {}

    // Добавляем характеристики, если они есть
    newSpecs.value.forEach(spec => {
      if (spec.key && spec.value) {
        specs[spec.key] = spec.value
      }
    })

    // Добавляем топливо только если оно выбрано
    if (newProdSelectedFuels.value.length > 0) {
      specs.fuel = newProdSelectedFuels.value
    }

    // Добавляем мощность только если оба значения указаны
    if (newProdPowerValue.value && newProdPowerUnit.value) {
      specs.power = `${newProdPowerValue.value} ${newProdPowerUnit.value}`
    }

    // Подготовка данных товара
    const productData = {
      name: newProd.value.name,
      description: newProd.value.description,
      extendedDescription: newProd.value.extendedDescription,
      price: Number(newProd.value.price),
      image: newProd.value.image || '/images/placeholders/placeholder.png',
      category_id: categoryId,
      category_name: categoryName,
      category_slug: categorySlug,
      specs: Object.keys(specs).length > 0 ? specs : undefined, // Если specs пустой, не отправляем его
      additional_images: newProdGallery.value.length > 0 ? newProdGallery.value : undefined,
      delivery_set: newProd.value.delivery_set || undefined,
      connection_scheme: newProd.value.connection_scheme || undefined
    }


    // Отправляем запрос на создание товара
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    })

    const responseData = await response.json()

    if (!response.ok) {
      throw new Error(`Failed to create product: ${responseData.message || 'Unknown error'}`)
    }

    // Очищаем форму после успешного добавления
    resetForm()
    
    // Обновляем список товаров
    await refreshProducts()

    // Показываем уведомление об успехе
    modalStore.openModal("Успех","Товар успешно добавлен")

  } catch (error: any) {
    console.error('Error adding product:', error)
    modalStore.openModal("Ошибка",`Ошибка при добавлении товара: ${error.message || 'Неизвестная ошибка'}`)
  }
}

// Функция очистки формы
const resetForm = () => {
  newProd.value = {
    name: '',
    description: '',
    extendedDescription: '',
    price: 0,
    image: '',
    category: '',
    delivery_set: '',
    connection_scheme: ''
  }
  newCategory.value = {
    name: '',
    description: '',
    slug: ''
  }
  newSpecs.value = []
  newProdPowerValue.value = undefined
  newProdPowerUnit.value = ''
  newProdSelectedFuels.value = []
  newProdGallery.value = []
}

function toggle(id: number) {
  activeId.value = activeId.value === id ? null : id
  if (activeId.value === id) {
    const productToEdit = products.value.find(p => p.id === id)
    if (productToEdit) {
      // Устанавливаем текущую категорию
      if (productToEdit.category_name) {
        productToEdit.category = productToEdit.category_name
      }

      // Обновляем specsList для редактируемого продукта, включая все характеристики
      specsList.value[id] = Object.entries(productToEdit.specs || {})
        .filter(([key]) => key !== 'images') // Исключаем только images, так как они обрабатываются отдельно
        .map(([k,v]) => ({
          key: k, 
          value: String(v),
          showKeySuggestions: false,
          showValueSuggestions: false
        }))
      
      // Убеждаемся, что поле images существует в specs
      if (!productToEdit.specs) {
        productToEdit.specs = {}
      }
      if (!Array.isArray(productToEdit.specs.images)) {
        productToEdit.specs.images = []
      }
    }
  }
}

// Обновляем функцию updateWithSpecs
async function updateWithSpecs(p: Product) {
  try {
    // Подготовка спецификаций
    const specs: Record<string, any> = {}

    // Добавляем все характеристики из specsList
    specsList.value[p.id]?.forEach(s => {
      if (s.key && s.value) {
        specs[s.key] = s.value
      }
    })

    // Добавляем изображения галереи, если есть
    if (p.specs && Array.isArray(p.specs.images)) {
      specs.images = p.specs.images
    }

    // Очищаем старые поля из specs перед отправкой
    const cleanSpecs: Record<string, any> = {}
    Object.entries(specs).forEach(([key, value]) => {
      if (!['power', 'fuel', 'powerUnit'].includes(key)) {
        cleanSpecs[key] = value
      }
    })

    // Находим категорию
    const category = categories.value.find(c => c.name === p.category)
    if (!category) {
      console.error('Category not found:', p.category)
      return
    }

    // Подготовка данных для обновления
    const updateData = {
      id: p.id,
      name: p.name,
      description: p.description,
      extendedDescription: p.extendedDescription,
      price: p.price,
      image: p.image,
      category_id: category.id,
      specs: Object.keys(cleanSpecs).length > 0 ? cleanSpecs : null,
      additional_images: Array.isArray(p.specs?.images) ? p.specs.images : null,
      delivery_set: p.delivery_set || null,
      connection_scheme: p.connection_scheme || null
    }
 

    await $fetch(`/api/products/${p.id}`, {
      method: 'PUT',
      body: updateData
    })

    // Обновляем данные локально вместо перезагрузки
    const productIndex = products.value.findIndex(prod => prod.id === p.id)
    if (productIndex !== -1) {
      products.value[productIndex] = {
        ...products.value[productIndex],
        name: p.name,
        description: p.description,
        extendedDescription: p.extendedDescription,
        price: p.price,
        image: p.image,
        category: p.category,
        specs: cleanSpecs,
        delivery_set: p.delivery_set,
        connection_scheme: p.connection_scheme
      }
    }

    activeId.value = null
  } catch (error) {
    console.error('Error updating product:', error)
  }
}

function cancelEdit() {
  activeId.value = null
}

function addSpec(id:number) {
  specsList.value[id].push({ 
    key:'', 
    value:'',
    showKeySuggestions: false,
    showValueSuggestions: false
  })
}

function removeSpec(id:number, idx:number) {
  specsList.value[id].splice(idx,1)
}

function addNewSpec() {
  if (newSpec.value.key && newSpec.value.value) {
    newSpecs.value.push({ 
      key:newSpec.value.key, 
      value:newSpec.value.value,
      showKeySuggestions: false,
      showValueSuggestions: false
    })
    newSpec.value.key = ''
    newSpec.value.value = ''
  }
}

function removeNewSpec(idx:number) {
  newSpecs.value.splice(idx,1)
}

async function deleteProduct(id:number) {
  const prodToDelete = products.value.find(x=>x.id===id)
  const cat = prodToDelete?.category
  const desc = prodToDelete?.specs?.categoryDescription
  await $fetch(`/api/products/${id}`, { method:'DELETE' })
  products.value = products.value.filter(x=>x.id!==id)
  delete specsList.value[id]
  if (cat && desc) {
    // Найти следующий товар этой категории
    const next = products.value.find(x=>x.category===cat)
    if (next && (!next.specs || !next.specs.categoryDescription)) {
      if (!next.specs) next.specs = {}
      next.specs.categoryDescription = desc
      // Сохраняем обновление на сервере
      await $fetch(`/api/products/${next.id}`, {
        method: 'PUT',
        body: { ...next, specs: next.specs }
      })
    }
  }
}

// Импортируем новый composable для работы с файлами
const { uploadSingleFile, uploadFiles } = useFileStorage()

async function handleImageUpload(event: Event, product: Product | Partial<Product>) {
  const input = event.target as HTMLInputElement
  if (!input.files || !input.files[0]) return

  const file = input.files[0]

  try {
    const filePath = await uploadSingleFile(file)
    product.image = filePath
  } catch (error) {
    console.error('Error uploading image:', error)
  }
}

async function handleConnectionSchemeUpload(event: Event, product: Product | Partial<Product>) {
  const input = event.target as HTMLInputElement;
  if (!input.files || !input.files[0]) return;

  const file = input.files[0];

  try {
    const filePath = await uploadSingleFile(file);
    product.connection_scheme = filePath;
  } catch (error) {
    console.error('Error uploading connection scheme image:', error);
  }
}

function toggleNewProdFuelDropdown() {
  showNewProdFuelDropdown.value = !showNewProdFuelDropdown.value;
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

// Обновленная функция загрузки галереи
async function handleGalleryUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  
  const files = Array.from(input.files)
  
  try {
    const filePaths = await uploadFiles(files)
    newProdGallery.value.push(...filePaths)
  } catch (error) {
    console.error('Error uploading gallery images:', error)
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

// Обновленная функция загрузки галереи для редактирования
async function handleEditGalleryUpload(event: Event, p: Product) {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  
  const files = Array.from(input.files)
  if (!p.specs) p.specs = {}
  if (!Array.isArray(p.specs.images)) p.specs.images = []
  
  try {
    const filePaths = await uploadFiles(files)
    p.specs.images.push(...filePaths)
  } catch (error) {
    console.error('Error uploading gallery images:', error)
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
  selectedRequest.value = request
}

const closeRequestDetails = () => { 
  selectedRequest.value = null
}

// Add this computed property in the script section
const filteredSpecs = computed(() => (id: number) => {
  return specsList.value[id] || []
})

const showCategoryDescriptionModal = ref(false)
function confirmCategoryDescription() {
  showCategoryDescriptionModal.value = false
  // Продолжить создание категории и товара
}

// Функции для работы с категориями
const editingCategory = ref<any>(null)
const showAddCategoryModal = ref(false)
const showEditCategoryModal = ref(false)

// Функция для генерации slug из названия
watch(() => newCategory.value.name, (newName) => {
  if (newName) {
    newCategory.value.slug = transliterate(newName)
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }
})

// Добавление категории
async function addCategory() {
  try {
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: newCategory.value.name,
        description: newCategory.value.description,
        slug: newCategory.value.slug
      })
    })

    if (!response.ok) {
      throw new Error('Failed to create category')
    }

    const data = await response.json()
    categories.value.push({
      id: data.id,
      name: data.title,
      description: data.description,
      slug: data.slug
    })

    // Очищаем форму и закрываем модальное окно
    newCategory.value = {
      name: '',
      description: '',
      slug: ''
    }
    showAddCategoryModal.value = false
  } catch (error) {
    console.error('Error creating category:', error)
    modalStore.showError('Ошибка при создании категории')
  }
}

// Редактирование категории
function editCategory(category: AdminCategory) {
  editingCategory.value = { ...category }
  showEditCategoryModal.value = true
}

// Сохранение изменений категории
async function saveCategory() {
  try {
    if (!editingCategory.value) {
      throw new Error('No category being edited')
    }

    const response = await fetch(`/api/categories/${editingCategory.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: editingCategory.value.name,
        description: editingCategory.value.description || '',
        slug: editingCategory.value.slug
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.statusMessage || 'Failed to update category')
    }

    const updatedCategory = await response.json()

    // Обновляем категорию в списке
    const index = categories.value.findIndex(c => c.id === editingCategory.value.id)
    if (index !== -1) {
      categories.value[index] = {
        id: updatedCategory.id,
        name: updatedCategory.name,
        slug: updatedCategory.slug,
        description: updatedCategory.description
      }
    }

    closeEditCategoryModal()
    modalStore.showSuccess('Категория успешно обновлена')
  } catch (error: any) {
    console.error('Error updating category:', error)
    modalStore.showSuccess(`Ошибка при обновлении категории: ${error.message || 'Неизвестная ошибка'}`)
  }
}

// Удаление категории
async function deleteCategory(id: string) {
  modalStore.openModal(
    "Удаление",
    'Вы уверены, что хотите удалить эту категорию?',
    "Подтвердить",
    async () => {
      try {
        const response = await fetch(`/api/categories/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        const data = await response.json()

        if (!response.ok) {
          if (response.status === 400 && data.statusMessage?.includes('Cannot delete category that contains products')) {
            modalStore.openModal("Ошибка",'Невозможно удалить категорию, содержащую товары. Сначала переместите или удалите все товары из этой категории.')
            return
          }
          throw new Error(data.statusMessage || 'Failed to delete category')
        }

        // Удаляем категорию из списка только после успешного удаления на сервере
        categories.value = categories.value.filter(cat => cat.id !== id)
        modalStore.openModal("Успех",'Категория успешно удалена')
      } catch (error: any) {
        console.error('Error deleting category:', error)
        modalStore.openModal("Ошибка",`Ошибка при удалении категории: ${error.message || 'Неизвестная ошибка'}`)
      }
    }
  )
}

// Закрытие модального окна редактирования
function closeEditCategoryModal() {
  showEditCategoryModal.value = false
  editingCategory.value = null
}

// Получение количества товаров в категории
function getCategoryProductCount(categoryId: string): number {
  const category = categories.value.find(c => c.id === categoryId) 
  
  const count = products.value.filter(product => {
    const matches = category && (
      product.category === category.name ||
      product.category_id === categoryId ||
      product.category_slug === category.slug
    ) 
    return matches
  }).length
 
  return count
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

.category-modal {
  background: var(--color-background);
  border-radius: 8px;
  padding: 20px;
  min-width: 300px;
  max-width: 500px;
}

.modal-header {
  text-align: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--color-text);
}

.category-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category-form input,
.category-form textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
}

.category-form textarea {
  min-height: 100px;
  resize: vertical;
}

.category-form input:focus,
.category-form textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.category-form button {
  width: 100%;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.optional-specs {
  margin: 20px 0;
  padding: 15px;
  border: 1px dashed #ddd;
  border-radius: 4px;
}

.optional-specs .filter-group {
  margin-bottom: 15px;
}

.optional-specs label {
  color: #666;
  font-style: italic;
}

.category-manager {
  padding: 2rem;
  background: var(--bg);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);

  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }

  .category-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }

    &__header {
      padding: 1rem;
      background: var(--primary-light);
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        color: var(--primary);
        font-size: 1.2rem;
      }
    }

    &__actions {
      display: flex;
      gap: 0.5rem;

      .btn {
        padding: 0.4rem 0.8rem;
        font-size: 0.9rem;
      }
    }

    &__content {
      padding: 1rem;

      .category-info {
        margin-bottom: 1rem;

        p {
          margin: 0.5rem 0;
        }

        .category-description {
          font-size: 0.9rem;
          color: var(--text-light);
          margin-top: 0.5rem;
        }
      }

      .category-stats {
        padding-top: 1rem;
        border-top: 1px solid var(--border);
        font-size: 0.9rem;
      }
    }
  }
}

.category-form {
  .form-group {
    margin-bottom: 1rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border);
      border-radius: 4px;
      font-size: 0.95rem;

      &:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
      }

      &:disabled {
        background: var(--bg-light);
        cursor: not-allowed;
      }
    }

    textarea.form-control {
      resize: vertical;
      min-height: 100px;
    }
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
  }
}
</style>

