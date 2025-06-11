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
              <table class="specs-table">
                <tbody>
                <tr
                  v-for="(spec, idx) in specsList[p.id]"
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
import { ref, reactive, onMounted, computed } from 'vue'
import { useRuntimeConfig } from '#app'

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
  specs?: Record<string,string>
}

const config = useRuntimeConfig().public
const password = ref('')
const loginError = ref('')
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

// Предзаготовленные картинки
const presetImages = [
  '/images/cutouts/kotel1.png',
  '/images/cutouts/kotel2.png',
  '/images/cutouts/kotel3.png'
]

const categories = ref<string[]>([])

// Валидация формы
const isFormValid = computed(() => {
  return newProd.value.name && 
         newProd.value.description && 
         typeof newProd.value.price === 'number' && newProd.value.price > 0 && 
         newProd.value.category && 
         (newProd.value.category !== 'new' || (newCategory.value && !categories.value.includes(newCategory.value)))
})

function validateNewCategory() {
  if (newCategory.value && categories.value.includes(newCategory.value)) {
    newProd.value.category = newCategory.value
    newCategory.value = ''
  }
}

async function loadProducts() {
  products.value = await $fetch<Product[]>('/api/products')
  products.value.forEach(p => {
    specsList.value[p.id] = Object.entries(p.specs||{}).map(([k,v])=>({key:k,value:v}))
  })
}

async function loadCategories() {
  try {
    // Получаем все товары и извлекаем уникальные категории
    const products = await $fetch<Product[]>('/api/products')
    categories.value = [...new Set(products.map(p => p.category))]
  } catch (e) {
    console.error('Ошибка загрузки категорий:', e)
  }
}

function login() {
  if (password.value === config.adminPassword) {
    authorized.value = true
    loadProducts()
    loadCategories()
  } else {
    loginError.value = 'Неправильный пароль'
  }
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

  const specs: Record<string,string> = {}
  newSpecs.value.forEach(s => specs[s.key] = s.value)
  
  const added = await $fetch<Product>('/api/products', {
    method: 'POST',
    body: { ...newProd.value, category, specs }
  })
  
  products.value.push(added)
  specsList.value[added.id] = newSpecs.value.slice()
  
  // Обновляем список категорий после добавления товара
  await loadCategories()
  
  // Очистка формы
  newProd.value.name = ''
  newProd.value.description = ''
  newProd.value.extendedDescription = ''
  newProd.value.price = 0
  newProd.value.image = ''
  newProd.value.category = ''
  newCategory.value = ''
  newSpecs.value.splice(0)
}

function toggle(id:number) {
  activeId.value = activeId.value === id ? null : id
}

async function updateWithSpecs(p:Product) {
  let specs: Record<string,string> = {}
  specsList.value[p.id].forEach(s=> specs[s.key]=s.value)
  await $fetch<Product>(`/api/products/${p.id}`, {
    method: 'PUT',
    body: { ...p, specs }
  })
  activeId.value = null
}

function cancelEdit() {
  activeId.value = null
}

function addSpec(id:number) {
  specsList.value[id].push({ key:'', value:'' })
}

function removeSpec(id:number, idx:number) {
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

onMounted(() => {
  if (authorized.value) {
    loadProducts()
    loadCategories()
  }
})
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
</style>
