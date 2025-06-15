<template>
  <section class="admin-section container">
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
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ cat }}
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
            @change="(e) => handleImageUpload(e, newProd)"
            class="image-input"
          />
        </div>
        <img
          v-if="newProd.image && newProd.image !== 'custom'"
          :src="newProd.image"
          class="img-preview"
        />

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
                  <option v-for="cat in categories" :key="cat" :value="cat">
                    {{ cat }}
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
                  @change="(e) => handleImageUpload(e, p)"
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
                  v-for="(spec, idx) in specsList[p.id].filter(s => s.key !== 'power' && s.key !== 'fuel')"
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
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRuntimeConfig } from '#app'

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
  name: string
  image?: string
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

const config = useRuntimeConfig().public
const password = ref('')
const loginError = ref<string | null>(null)
const authorized = ref(false)
const products = ref<Product[]>([])
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
const specsList = ref<Record<number, Spec[]>>({})
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

const categories = ref<string[]>([])

// Валидация формы
const isFormValid = computed(() => {
  const baseValid = newProd.value.name && 
         newProd.value.description && 
         typeof newProd.value.price === 'number' && newProd.value.price > 0 && 
         newProd.value.category && 
         (newProd.value.category !== 'new' || (newCategory.value && !categories.value.includes(newCategory.value)))

  const powerValid = !(newProdPowerValue.value > 0 && !newProdPowerUnit.value)

  return baseValid && powerValid
})

function validateNewCategory() {
  if (newCategory.value && categories.value.includes(newCategory.value)) {
    newProd.value.category = newCategory.value
    newCategory.value = ''
  }
}

// Move product and category loading to top-level script setup
const { data: fetchedProducts, error: productsFetchError } = await useFetch<Product[]>('/api/products')
const { data: fetchedCategories, error: categoriesFetchError } = await useFetch<any[]>('/api/categories')

if (fetchedProducts.value) {
  products.value = fetchedProducts.value.map(product => {
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
      slug: transliterate(product.name).toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'),
      specs: {
        ...product.specs,
        power: powerValue,
        powerUnit: powerUnit,
        fuel: fuel,
      }
    }
  })
}

if (fetchedCategories.value) {
  categories.value = fetchedCategories.value.map(cat => cat.title)
}

if (productsFetchError.value) {
  console.error('Error fetching products for admin:', productsFetchError.value)
}

if (categoriesFetchError.value) {
  console.error('Error fetching categories for admin:', categoriesFetchError.value)
}

// Update specsList after products are loaded
watch(products, (newProducts) => {
  newProducts.forEach(p => {
    specsList.value[p.id] = Object.entries(p.specs || {}).map(([k,v]) => ({key: k, value: String(v)}))
  })
}, { immediate: true })

function login() {
  if (password.value === config.adminPassword) {
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

async function addProduct() {
  if (!isFormValid.value) return
  
  let category = newProd.value.category
  if (category === 'new') {
    // Проверяем, что категория не существует
    if (categories.value.includes(newCategory.value)) {
      console.error('Категория уже существует')
      return
    }
    category = newCategory.value
  }

  // Инициализация specs с значениями по умолчанию и добавление из newSpecs
  const productSpecs: Record<string, any> = {}
  
  // Добавляем мощность и топливо из новых полей ввода
  productSpecs.power = newProdPowerValue.value + ' ' + newProdPowerUnit.value
  productSpecs.fuel = newProdSelectedFuels.value.join(', ')

  newSpecs.value.forEach(spec => {
    if (spec.key && spec.value) {
      productSpecs[spec.key] = spec.value
    }
  })

  const added = await $fetch<Product>('/api/products', {
    method: 'POST',
    body: { ...newProd.value, category, specs: productSpecs }
  })
  
  products.value.push(added)
  specsList.value[added.id] = newSpecs.value.slice()
  
  // Очистка формы
  newProd.value.name = ''
  newProd.value.description = ''
  newProd.value.extendedDescription = ''
  newProd.value.price = 0
  newProd.value.image = ''
  newProd.value.category = ''
  newCategory.value = ''
  newSpecs.value.splice(0)
  // Очищаем новые поля мощности и топлива
  newProdPowerValue.value = 0
  newProdPowerUnit.value = ''
  newProdSelectedFuels.value = []
  showNewProdFuelDropdown.value = false
}

function toggle(id:number) {
  activeId.value = activeId.value === id ? null : id
  if (activeId.value === id) {
    const productToEdit = products.value.find(p => p.id === id)
    if (productToEdit) {
      // Инициализируем значения для редактирования мощности
      const powerMatch = productToEdit.specs?.power?.match(/^(\d+(\.\d+)?)\s*(.*)$/)
      if (powerMatch) {
        editProdPowerValue.value = parseFloat(powerMatch[1])
        editProdPowerUnit.value = powerMatch[3]
      } else {
        editProdPowerValue.value = 0
        editProdPowerUnit.value = ''
      }

      // Инициализируем значения для редактирования топлива
      if (productToEdit.specs?.fuel) {
        editProdSelectedFuels.value = productToEdit.specs.fuel.split(', ').filter((f: string) => f !== 'отсутствует')
      } else {
        editProdSelectedFuels.value = []
      }

      // Обновляем specsList для редактируемого продукта
      specsList.value[id] = Object.entries(productToEdit.specs || {}).map(([k,v]) => ({key: k, value: v}))
      showEditProdFuelDropdown.value = false;
    }
  } else {
    showEditProdFuelDropdown.value = false;
  }
}

async function updateWithSpecs(p:Product) {
  let specs: Record<string,string> = {}

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

  // Добавляем остальные характеристики, кроме power и fuel, чтобы не дублировать
  specsList.value[p.id].filter(s => s.key !== 'power' && s.key !== 'fuel').forEach(s => specs[s.key] = s.value)
  
  await $fetch<Product>(`/api/products/${p.id}`, {
    method: 'PUT',
    body: { ...p, specs }
  })
  activeId.value = null
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

function handleImageUpload(e: Event, p: Product | Partial<Product>) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      if (p) {
        p.image = event.target?.result as string
      }
    }
    reader.readAsDataURL(file)
  }
}

function toggleNewProdFuelDropdown() {
  showNewProdFuelDropdown.value = !showNewProdFuelDropdown.value;
}

function toggleEditProdFuelDropdown() {
  showEditProdFuelDropdown.value = !showEditProdFuelDropdown.value;
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

    h2 {
      margin-bottom: 1.5rem;
      text-align: center;
      font-size: 1.5rem;
      color: var(--text);
    }

    input {
      width: 100%;
      padding: 0.75rem;
      margin-bottom: 1rem;
      border: 1px solid var(--secondary);
      border-radius: 0.5rem;
      font-size: 0.95rem;

      @media (min-width: 768px) {
        font-size: 1rem;
      }
    }

    button {
      width: 100%;
      padding: 0.75rem;
      font-size: 0.95rem;

      @media (min-width: 768px) {
        font-size: 1rem;
      }
    }

    .error {
      color: #dc3545;
      margin-top: 1rem;
      text-align: center;
      font-size: 0.9rem;
    }
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
</style>
