<template>
  <!-- Каталог -->
  <div v-if="adminTab==='catalog'">
    <!-- Вход в админ-панель -->
    <div v-if="!authorized" class="login-box">
      <h2>Вход в админ-панель</h2>
      <input
        :value="passwordLocal"
        @input="onPasswordInput"
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
        <!-- Основная информация -->
        <div class="edit-section">
          <h3 class="edit-section__title">Основная информация</h3>
          <div class="edit-section__content">
            <div class="form-row">
              <div class="form-group">
                <label class="required">Категория:</label>
                <div class="category-input">
                  <select v-model="newProdLocal.category" class="form-control">
                    <option value="">Выберите категорию</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.name">
                      {{ cat.name }}
                    </option>
                    <option value="new">+ Добавить новую категорию</option>
                  </select>
                  <input
                    v-if="newProdLocal.category === 'new'"
                    v-model="newCategoryLocal.name"
                    placeholder="Название новой категории"
                    class="form-control"
                  />
                </div>
              </div>
              <div class="form-group">
                <label class="required">Название:</label>
                <input
                  v-model="newProdLocal.name"
                  placeholder="Название товара"
                  class="form-control"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label class="required">Краткое описание:</label>
              <textarea
                v-model="newProdLocal.description"
                placeholder="Краткое описание товара"
                rows="2"
                class="form-control"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label>Расширенное описание:</label>
              <textarea
                v-model="newProdLocal.extendedDescription"
                placeholder="Подробное описание товара"
                rows="3"
                class="form-control"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label class="required">Цена (₽):</label>
              <input
                v-model.number="newProdLocal.price"
                type="number"
                placeholder="0"
                class="form-control"
              />
            </div>
          </div>
        </div>

        <!-- Изображения -->
        <div class="edit-section">
          <h3 class="edit-section__title">Изображения</h3>
          <div class="edit-section__content">
            <div class="form-group">
              <label>Основное изображение:</label>
              <div class="image-upload">
                <select v-model="newProdLocal.image" class="image-select form-control">
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
                  v-if="newProdLocal.image === 'custom'"
                  type="file"
                  accept="image/*"
                  @change="(e: any) => handleImageUpload(e, newProdLocal)"
                  class="image-input"
                />
              </div>
              <div v-if="newProdLocal.image && newProdLocal.image !== 'custom'" class="image-preview-container">
                <img
                  :src="newProdLocal.image"
                  class="img-preview"
                  alt="Основное изображение"
                />
              </div>
            </div>

            <div class="form-group">
              <label>Дополнительные изображения:</label>
              <input type="file" multiple accept="image/*" @change="handleGalleryUpload" class="form-control" />
              <div class="gallery-previews">
                <div v-for="(gimg, gidx) in newProdGallery" :key="gidx" class="gallery-item">
                  <img :src="gimg" class="img-preview" />
                  <button class="btn btn-danger btn-sm gallery-remove-btn" @click.prevent="removeGalleryImage(gidx)">✕</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Дополнительная информация -->
        <div class="edit-section">
          <h3 class="edit-section__title">Дополнительная информация</h3>
          <div class="edit-section__content">
            <div class="form-group">
              <label>Комплект поставки:</label>
              <textarea
                v-model="newProdLocal.delivery_set"
                placeholder="Опишите комплект поставки товара"
                rows="3"
                class="form-control"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Схема подключения:</label>
              <input
                type="file"
                accept="image/*"
                @change="(e) => handleConnectionSchemeUpload(e, newProdLocal)"
                class="form-control"
              />
              <div v-if="newProdLocal.connection_scheme" class="image-preview-container">
                <img
                  :src="newProdLocal.connection_scheme"
                  class="img-preview"
                  alt="Схема подключения"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Характеристики -->
        <div class="edit-section">
          <h3 class="edit-section__title">Характеристики</h3>
          <div class="edit-section__content">
            <!-- Быстрое копирование характеристик -->
            <div class="quick-specs-copy">
              <label>Быстрое копирование характеристик:</label>
              <div class="copy-controls">
                <select v-model="selectedProductForCopy" @change="previewSpecsFromProduct" class="form-control">
                  <option value="">Выберите товар для копирования характеристик</option>
                  <option v-for="p in products" :key="p.id" :value="p.id">
                    {{ p.name }} ({{ p.category_name }})
                  </option>
                </select>
                <button 
                  v-if="selectedProductForCopy && previewedSpecs.length > 0" 
                  @click="confirmCopySpecs" 
                  class="btn btn-primary btn-sm"
                >
                  Подтвердить копирование
                </button>
                <button 
                  v-if="selectedProductForCopy" 
                  @click="clearCopySelection" 
                  class="btn btn-secondary btn-sm"
                >
                  Отмена
                </button>
              </div>
              
              <!-- Предварительный просмотр характеристик -->
              <div v-if="previewedSpecs.length > 0" class="preview-specs">
                <h4>Предварительный просмотр характеристик:</h4>
                <div class="preview-specs-list">
                  <div v-for="(spec, idx) in previewedSpecs" :key="idx" class="preview-spec-item">
                    <strong>{{ spec.key }}:</strong> {{ spec.value }}
                  </div>
                </div>
              </div>
            </div>

            <table class="specs-table">
              <thead>
                <tr>
                  <th>Параметр</th>
                  <th>Значение</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(spec, idx) in newSpecsLocal" :key="idx">
                  <td>
                    <div class="spec-input-container">
                      <input 
                        v-model="spec.key" 
                        placeholder="Параметр" 
                        @input="onSpecKeyInput(spec, $event)"
                        @focus="showSpecSuggestions(spec)"
                        @blur="hideSpecSuggestions"
                        class="form-control"
                      />
                      <div v-if="spec.showKeySuggestions && specKeySuggestions.length > 0" class="spec-suggestions">
                        <div 
                          v-for="suggestion in specKeySuggestions" 
                          :key="suggestion"
                          @click="selectSpecKey(spec, suggestion)"
                          class="spec-suggestion-item"
                        >
                          {{ suggestion }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="spec-input-container">
                      <input 
                        v-model="spec.value" 
                        placeholder="Значение" 
                        @input="onSpecValueInput(spec, $event)"
                        @focus="showValueSuggestions(spec)"
                        @blur="hideValueSuggestions"
                        class="form-control"
                      />
                      <div v-if="spec.showValueSuggestions && specValueSuggestions.length > 0" class="spec-suggestions">
                        <div 
                          v-for="suggestion in specValueSuggestions" 
                          :key="suggestion"
                          @click="selectSpecValue(spec, suggestion)"
                          class="spec-suggestion-item"
                        >
                          {{ suggestion }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <button class="btn-sm" @click.prevent="removeNewSpec(idx)"><UiDeleteSmall/></button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="spec-input-container">
                      <input 
                        v-model="newSpecLocal.key" 
                        placeholder="Новая характеристика" 
                        @input="onNewSpecKeyInput($event)"
                        @focus="showNewSpecKeySuggestions"
                        @blur="hideNewSpecKeySuggestions"
                        class="form-control"
                      />
                      <div v-if="showNewSpecKeySuggestionsFlag && newSpecKeySuggestions.length > 0" class="spec-suggestions">
                        <div 
                          v-for="suggestion in newSpecKeySuggestions" 
                          :key="suggestion"
                          @click="selectNewSpecKey(suggestion)"
                          class="spec-suggestion-item"
                        >
                          {{ suggestion }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="spec-input-container">
                      <input 
                        v-model="newSpecLocal.value" 
                        placeholder="Значение" 
                        @input="onNewSpecValueInput($event)"
                        @focus="showNewSpecValueSuggestions"
                        @blur="hideNewSpecValueSuggestions"
                        class="form-control"
                      />
                      <div v-if="showNewSpecValueSuggestionsFlag && newSpecValueSuggestions.length > 0" class="spec-suggestions">
                        <div 
                          v-for="suggestion in newSpecValueSuggestions" 
                          :key="suggestion"
                          @click="selectNewSpecValue(suggestion)"
                          class="spec-suggestion-item"
                        >
                          {{ suggestion }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <button class="btn btn-secondary btn-sm" @click.prevent="addNewSpec">Добавить</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Действия -->
        <div class="edit-section edit-section--actions">
          <div class="edit-section__content">
            <button class="btn btn-primary" @click="addProduct" :disabled="!isFormValid">
              Добавить товар
            </button>
          </div>
        </div>
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
            <span class="prod-summary__category">{{ p.category_name }}</span>
            <span class="prod-summary__name">{{ p.name }}</span>
            <span class="prod-summary__price">{{ p.price }} ₽</span>
            <button
              @click.stop="deleteProduct(p.id)"
            ><UiDeleteSmall /></button>
          </div>

          <!-- Детальная форма редактирования -->
          <transition name="slide">
            <div
              v-if="activeId === p.id"
              class="prod-details"
            >
              <!-- Основная информация -->
              <div class="edit-section">
                <h3 class="edit-section__title">Основная информация</h3>
                <div class="edit-section__content">
                  <div class="form-row">
                    <div class="form-group">
                      <label>Категория:</label>
                      <select v-model="p.category" class="form-control">
                        <option value="">Выберите категорию</option>
                        <option v-for="cat in categories" :key="cat.id" :value="cat.name">
                          {{ cat.name }}
                        </option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label>Название:</label>
                      <input v-model="p.name" class="form-control" />
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label>Краткое описание:</label>
                    <textarea v-model="p.description" rows="2" class="form-control"></textarea>
                  </div>
                  
                  <div class="form-group">
                    <label>Расширенное описание:</label>
                    <textarea v-model="p.extendedDescription" rows="3" class="form-control"></textarea>
                  </div>
                  
                  <div class="form-group">
                    <label>Цена (₽):</label>
                    <input type="number" v-model.number="p.price" class="form-control" />
                  </div>
                </div>
              </div>

              <!-- Изображения -->
              <div class="edit-section">
                <h3 class="edit-section__title">Изображения</h3>
                <div class="edit-section__content">
                  <div class="form-group">
                    <label>Основное изображение:</label>
                    <div class="image-upload">
                      <select v-model="p.image" class="image-select form-control">
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
                    <div v-if="p.image && p.image !== 'custom'" class="image-preview-container">
                      <img
                        :src="p.image"
                        class="img-preview"
                        alt="Основное изображение"
                      />
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Дополнительные изображения:</label>
                    <input type="file" multiple accept="image/*" @change="(e: Event) => handleEditGalleryUpload(e, p)" class="form-control" />
                    <div class="gallery-previews">
                      <div v-for="(gimg, gidx) in (p.specs?.images || [])" :key="gidx" class="gallery-item">
                        <img :src="gimg" class="img-preview" />
                        <button class="btn btn-danger btn-sm gallery-remove-btn" @click.prevent="removeEditGalleryImage(p, gidx)">✕</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Дополнительная информация -->
              <div class="edit-section">
                <h3 class="edit-section__title">Дополнительная информация</h3>
                <div class="edit-section__content">
                  <div class="form-group">
                    <label>Комплект поставки:</label>
                    <textarea
                      v-model="p.delivery_set"
                      placeholder="Опишите комплект поставки товара"
                      rows="3"
                      class="form-control"
                    ></textarea>
                  </div>

                  <div class="form-group">
                    <label>Схема подключения:</label>
                    <input
                      type="file"
                      accept="image/*"
                      @change="(e) => handleConnectionSchemeUpload(e, p)"
                      class="form-control"
                    />
                    <div v-if="p.connection_scheme" class="image-preview-container">
                      <img
                        :src="p.connection_scheme"
                        class="img-preview"
                        alt="Схема подключения"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Характеристики -->
              <div class="edit-section">
                <h3 class="edit-section__title">Характеристики</h3>
                <div class="edit-section__content">
                  <table class="specs-table">
                    <tbody>
                    <tr
                      v-for="(spec, idx) in filteredSpecs(p.id)"
                      :key="idx"
                    >
                      <td>
                        <div class="spec-input-container">
                          <input
                            v-model="spec.key"
                            placeholder="Параметр"
                            @input="onEditSpecKeyInput(spec, $event)"
                            @focus="showEditSpecSuggestions(spec)"
                            @blur="hideEditSpecSuggestions"
                            class="form-control"
                          />
                          <div v-if="spec.showKeySuggestions && editSpecKeySuggestions.length > 0" class="spec-suggestions">
                            <div 
                              v-for="suggestion in editSpecKeySuggestions" 
                              :key="suggestion"
                              @click="selectEditSpecKey(spec, suggestion)"
                              class="spec-suggestion-item"
                            >
                              {{ suggestion }}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="spec-input-container">
                          <input
                            v-model="spec.value"
                            placeholder="Значение"
                            @input="onEditSpecValueInput(spec, $event)"
                            @focus="showEditValueSuggestions(spec)"
                            @blur="hideEditValueSuggestions"
                            class="form-control"
                          />
                          <div v-if="spec.showValueSuggestions && editSpecValueSuggestions.length > 0" class="spec-suggestions">
                            <div 
                              v-for="suggestion in editSpecValueSuggestions" 
                              :key="suggestion"
                              @click="selectEditSpecValue(spec, suggestion)"
                              class="spec-suggestion-item"
                            >
                              {{ suggestion }}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <button
                          @click.prevent="removeSpec(p.id, idx)"
                        ><UiDeleteSmall /></button>
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
                </div>
              </div>

              <!-- Действия -->
              <div class="edit-section edit-section--actions">
                <div class="prod-details__actions">
                  <button
                    class="btn btn-primary"
                    @click="updateWithSpecs(p)"
                  >
                    Сохранить изменения
                  </button>
                  <button
                    class="btn btn-secondary"
                    @click="cancelEdit"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFileStorage } from '~/composables/useFileStorage'

interface Spec {
  key: string;
  value: string;
  showKeySuggestions?: boolean;
  showValueSuggestions?: boolean;
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
  connection_scheme?: string
  delivery_set?: string
}

// Props
const props = defineProps<{
  adminTab: string
  authorized: boolean
  password: string
  loginError: string | null
  products: Product[]
  categories: AdminCategory[]
  specsList: Record<number, Spec[]>
  newProd: any
  newCategory: any
  activeId: number | null
  newSpecs: Spec[]
  newSpec: Spec
  newProdPowerValue: any
  newProdPowerUnit: string
  newProdSelectedFuels: any[]
  showNewProdFuelDropdown: boolean
  powerUnits: string[]
  availableFuels: string[]
  presetImages: string[]
  newProdGallery: string[]
  isFormValid: boolean
  modalStore: any
  filteredSpecs: (id: number) => Spec[]
}>()

// Emits
const emit = defineEmits<{
  (e: 'login'): void
  (e: 'logout'): void
  (e: 'addProduct'): void
  (e: 'resetForm'): void
  (e: 'toggle', id: number): void
  (e: 'updateWithSpecs', product: Product): void
  (e: 'cancelEdit'): void
  (e: 'addSpec', id: number): void
  (e: 'removeSpec', id: number, idx: number): void
  (e: 'addNewSpec'): void
  (e: 'removeNewSpec', idx: number): void
  (e: 'deleteProduct', id: number): void
  (e: 'handleImageUpload', event: Event, product: Product | Partial<Product>): void
  (e: 'toggleNewProdFuelDropdown'): void
  (e: 'handleGalleryUpload', event: Event): void
  (e: 'removeGalleryImage', idx: number): void
  (e: 'removeEditGalleryImage', product: Product, idx: number): void
  (e: 'handleEditGalleryUpload', event: Event, product: Product): void
  (e: 'handleConnectionSchemeUpload', event: Event, product: Product): void
  (e: 'update:password', val: string): void
  (e: 'update:newCategory', val: any): void
  (e: 'update:newProdPowerValue', val: any): void
  (e: 'update:newProdPowerUnit', val: string): void
  (e: 'update:newProdSelectedFuels', val: any[]): void
  (e: 'update:newProd', val: any): void
  (e: 'update:newSpec', val: Spec): void
  (e: 'update:newSpecs', val: Spec[]): void
}>()

// Локальная переменная для пароля
const passwordLocal = ref(props.password)
watch(() => props.password, (val) => { passwordLocal.value = val })
watch(passwordLocal, (val) => { emit('update:password', val) })

// Локальная переменная для newCategory
const newCategoryLocal = ref(props.newCategory)
watch(() => props.newCategory, (val) => { newCategoryLocal.value = val })
watch(newCategoryLocal, (val) => { emit('update:newCategory', val) })
watch(() => newCategoryLocal.value.name, () => {
  validateNewCategory()
})

// Локальные переменные для power и fuel props
const newProdPowerValueLocal = ref(props.newProdPowerValue)
watch(() => props.newProdPowerValue, (val) => { newProdPowerValueLocal.value = val })
watch(newProdPowerValueLocal, (val) => { emit('update:newProdPowerValue', val) })

const newProdPowerUnitLocal = ref(props.newProdPowerUnit)
watch(() => props.newProdPowerUnit, (val) => { newProdPowerUnitLocal.value = val })
watch(newProdPowerUnitLocal, (val) => { emit('update:newProdPowerUnit', val) })

const newProdSelectedFuelsLocal = ref(props.newProdSelectedFuels)
watch(() => props.newProdSelectedFuels, (val) => { newProdSelectedFuelsLocal.value = val })
watch(newProdSelectedFuelsLocal, (val) => { emit('update:newProdSelectedFuels', val) })

// Локальные переменные для newProd, newSpec, newSpecs
const newProdLocal = ref(props.newProd)
watch(() => props.newProd, (val) => { newProdLocal.value = val })
watch(newProdLocal, (val) => { emit('update:newProd', val) })

const newSpecLocal = ref(props.newSpec)
watch(() => props.newSpec, (val) => { newSpecLocal.value = val })
watch(newSpecLocal, (val) => { emit('update:newSpec', val) })

const newSpecsLocal = ref(props.newSpecs)
watch(() => props.newSpecs, (val) => { newSpecsLocal.value = val })
watch(newSpecsLocal, (val) => { emit('update:newSpecs', val) })

// Переменные для системы подсказок
const selectedProductForCopy = ref('')
const specKeySuggestions = ref<string[]>([])
const specValueSuggestions = ref<string[]>([])
const newSpecKeySuggestions = ref<string[]>([])
const newSpecValueSuggestions = ref<string[]>([])
const showNewSpecKeySuggestionsFlag = ref(false)
const showNewSpecValueSuggestionsFlag = ref(false)

// Переменные для подсказок в редактировании
const editSpecKeySuggestions = ref<string[]>([])
const editSpecValueSuggestions = ref<string[]>([])

// Переменные для предварительного просмотра характеристик
const previewedSpecs = ref<{key: string, value: string}[]>([])

// Получение всех уникальных ключей характеристик из существующих товаров
const getAllSpecKeys = computed(() => {
  const keys = new Set<string>()
  props.products.forEach(product => {
    if (product.specs) {
      Object.keys(product.specs).forEach(key => {
        keys.add(key)
      })
    }
  })
  return Array.from(keys).sort()
})

// Получение всех уникальных значений для конкретного ключа
const getSpecValuesForKey = (key: string) => {
  const values = new Set<string>()
  props.products.forEach(product => {
    if (product.specs && product.specs[key]) {
      values.add(String(product.specs[key]))
    }
  })
  return Array.from(values).sort()
}

// Предварительный просмотр характеристик из существующего товара
const previewSpecsFromProduct = () => {
  if (!selectedProductForCopy.value) {
    clearPreview()
    return
  }
  
  const product = props.products.find(p => p.id === Number(selectedProductForCopy.value))
  if (!product || !product.specs) {
    clearPreview()
    return
  }
  
  // Подготавливаем характеристики для предварительного просмотра
  previewedSpecs.value = []
  Object.entries(product.specs).forEach(([key, value]) => {
    previewedSpecs.value.push({ key, value: String(value) })
  })
}

// Подтверждение копирования характеристик
const confirmCopySpecs = () => {
  // Очищаем текущие характеристики
  newSpecsLocal.value = []
  
  // Копируем характеристики в пустые поля
  previewedSpecs.value.forEach(spec => {
    newSpecsLocal.value.push({ 
      key: spec.key, 
      value: spec.value,
      showKeySuggestions: false,
      showValueSuggestions: false
    })
  })
  
  // Очищаем предварительный просмотр и выбор
  clearCopySelection()
}

// Очистка выбора товара для копирования
const clearCopySelection = () => {
  selectedProductForCopy.value = ''
  clearPreview()
}

// Очистка предварительного просмотра
const clearPreview = () => {
  previewedSpecs.value = []
}

// Обработчики для подсказок ключей характеристик
const onSpecKeyInput = (spec: any, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.toLowerCase()
  
  if (value.length > 0) {
    specKeySuggestions.value = getAllSpecKeys.value.filter(key => 
      key.toLowerCase().includes(value)
    )
  } else {
    specKeySuggestions.value = getAllSpecKeys.value
  }
}

const showSpecSuggestions = (spec: any) => {
  spec.showKeySuggestions = true
  specKeySuggestions.value = getAllSpecKeys.value
}

const hideSpecSuggestions = () => {
  setTimeout(() => {
    specKeySuggestions.value = []
    newSpecsLocal.value.forEach(spec => {
      spec.showKeySuggestions = false
    })
  }, 200)
}

const selectSpecKey = (spec: any, key: string) => {
  spec.key = key
  spec.showKeySuggestions = false
  specKeySuggestions.value = []
}

// Обработчики для подсказок значений характеристик
const onSpecValueInput = (spec: any, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.toLowerCase()
  
  if (spec.key) {
    const allValues = getSpecValuesForKey(spec.key)
    if (value.length > 0) {
      specValueSuggestions.value = allValues.filter(val => 
        val.toLowerCase().includes(value)
      )
    } else {
      specValueSuggestions.value = allValues
    }
  }
}

const showValueSuggestions = (spec: any) => {
  spec.showValueSuggestions = true
  if (spec.key) {
    specValueSuggestions.value = getSpecValuesForKey(spec.key)
  }
}

const hideValueSuggestions = () => {
  setTimeout(() => {
    specValueSuggestions.value = []
    newSpecsLocal.value.forEach(spec => {
      spec.showValueSuggestions = false
    })
  }, 200)
}

const selectSpecValue = (spec: any, value: string) => {
  spec.value = value
  spec.showValueSuggestions = false
  specValueSuggestions.value = []
}

// Обработчики для новой характеристики
const onNewSpecKeyInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.toLowerCase()
  
  if (value.length > 0) {
    newSpecKeySuggestions.value = getAllSpecKeys.value.filter(key => 
      key.toLowerCase().includes(value)
    )
  } else {
    newSpecKeySuggestions.value = getAllSpecKeys.value
  }
}

const showNewSpecKeySuggestions = () => {
  showNewSpecKeySuggestionsFlag.value = true
  newSpecKeySuggestions.value = getAllSpecKeys.value
}

const hideNewSpecKeySuggestions = () => {
  setTimeout(() => {
    showNewSpecKeySuggestionsFlag.value = false
    newSpecKeySuggestions.value = []
  }, 200)
}

const selectNewSpecKey = (key: string) => {
  newSpecLocal.value.key = key
  showNewSpecKeySuggestionsFlag.value = false
  newSpecKeySuggestions.value = []
}

const onNewSpecValueInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.toLowerCase()
  
  if (newSpecLocal.value.key) {
    const allValues = getSpecValuesForKey(newSpecLocal.value.key)
    if (value.length > 0) {
      newSpecValueSuggestions.value = allValues.filter(val => 
        val.toLowerCase().includes(value)
      )
    } else {
      newSpecValueSuggestions.value = allValues
    }
  }
}

const showNewSpecValueSuggestions = () => {
  showNewSpecValueSuggestionsFlag.value = true
  if (newSpecLocal.value.key) {
    newSpecValueSuggestions.value = getSpecValuesForKey(newSpecLocal.value.key)
  }
}

const hideNewSpecValueSuggestions = () => {
  setTimeout(() => {
    showNewSpecValueSuggestionsFlag.value = false
    newSpecValueSuggestions.value = []
  }, 200)
}

const selectNewSpecValue = (value: string) => {
  newSpecLocal.value.value = value
  showNewSpecValueSuggestionsFlag.value = false
  newSpecValueSuggestions.value = []
}

// Обработчики для подсказок в редактировании
const onEditSpecKeyInput = (spec: any, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.toLowerCase()
  
  if (value.length > 0) {
    editSpecKeySuggestions.value = getAllSpecKeys.value.filter(key => 
      key.toLowerCase().includes(value)
    )
  } else {
    editSpecKeySuggestions.value = getAllSpecKeys.value
  }
}

const showEditSpecSuggestions = (spec: any) => {
  spec.showKeySuggestions = true
  editSpecKeySuggestions.value = getAllSpecKeys.value
}

const hideEditSpecSuggestions = () => {
  setTimeout(() => {
    editSpecKeySuggestions.value = []
    // Очищаем флаги для всех характеристик в редактировании
    props.products.forEach(product => {
      if (product.specs) {
        Object.keys(product.specs).forEach(key => {
          const spec = props.specsList[product.id]?.find(s => s.key === key)
          if (spec) {
            spec.showKeySuggestions = false
          }
        })
      }
    })
  }, 200)
}

const selectEditSpecKey = (spec: any, key: string) => {
  spec.key = key
  spec.showKeySuggestions = false
  editSpecKeySuggestions.value = []
}

const onEditSpecValueInput = (spec: any, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.toLowerCase()
  
  if (spec.key) {
    const allValues = getSpecValuesForKey(spec.key)
    if (value.length > 0) {
      editSpecValueSuggestions.value = allValues.filter(val => 
        val.toLowerCase().includes(value)
      )
    } else {
      editSpecValueSuggestions.value = allValues
    }
  }
}

const showEditValueSuggestions = (spec: any) => {
  spec.showValueSuggestions = true
  if (spec.key) {
    editSpecValueSuggestions.value = getSpecValuesForKey(spec.key)
  }
}

const hideEditValueSuggestions = () => {
  setTimeout(() => {
    editSpecValueSuggestions.value = []
    // Очищаем флаги для всех характеристик в редактировании
    props.products.forEach(product => {
      if (product.specs) {
        Object.keys(product.specs).forEach(key => {
          const spec = props.specsList[product.id]?.find(s => s.key === key)
          if (spec) {
            spec.showValueSuggestions = false
          }
        })
      }
    })
  }, 200)
}

const selectEditSpecValue = (spec: any, value: string) => {
  spec.value = value
  spec.showValueSuggestions = false
  editSpecValueSuggestions.value = []
}

// Methods
const login = () => emit('login')
const addProduct = () => {
  emit('addProduct')
}
const resetForm = () => emit('resetForm')
const toggle = (id: number) => emit('toggle', id)
const updateWithSpecs = (product: Product) => emit('updateWithSpecs', product)
const cancelEdit = () => emit('cancelEdit')
const addSpec = (id: number) => emit('addSpec', id)
const removeSpec = (id: number, idx: number) => emit('removeSpec', id, idx)
const addNewSpec = () => {
  if (newSpecLocal.value.key && newSpecLocal.value.value) {
    newSpecsLocal.value.push({ 
      key: newSpecLocal.value.key, 
      value: newSpecLocal.value.value,
      showKeySuggestions: false,
      showValueSuggestions: false
    })
    newSpecLocal.value.key = ''
    newSpecLocal.value.value = ''
  }
}
const removeNewSpec = (idx: number) => emit('removeNewSpec', idx)
const deleteProduct = (id: number) => emit('deleteProduct', id)
const handleImageUpload = (event: Event, product: Product | Partial<Product>) => emit('handleImageUpload', event, product)
const toggleNewProdFuelDropdown = () => emit('toggleNewProdFuelDropdown')
const handleGalleryUpload = (event: Event) => emit('handleGalleryUpload', event)
const removeGalleryImage = (idx: number) => emit('removeGalleryImage', idx)
const removeEditGalleryImage = (product: Product, idx: number) => emit('removeEditGalleryImage', product, idx)
const handleEditGalleryUpload = (event: Event, product: Product) => emit('handleEditGalleryUpload', event, product)
const handleConnectionSchemeUpload = (event: Event, product: Product) => emit('handleConnectionSchemeUpload', event, product)

function onPasswordInput(e: Event) {
  const target = e.target as HTMLInputElement | null
  if (target) passwordLocal.value = target.value
}

function onNewCategoryInput(e: Event) {
  const target = e.target as HTMLInputElement | null
  if (target) newCategoryLocal.value.name = target.value
}

const validateNewCategory = () => {
  if (newCategoryLocal.value.name && props.categories.some(c => c.name === newCategoryLocal.value.name)) {
    newProdLocal.value.category = newCategoryLocal.value.name
    newCategoryLocal.value.name = ''
  }
}

// Валидация формы добавления товара
const isFormValid = computed(() => {
  return !!(
    newProdLocal.value.category && 
    newProdLocal.value.name && 
    newProdLocal.value.description && 
    newProdLocal.value.price && 
    newProdLocal.value.price > 0
  )
})
</script>

<style lang="scss" scoped>
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

  .edit-section {
    background: var(--bg-light);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    margin-bottom: 1.5rem;
    overflow: visible !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    &__title {
      background: var(--primary);
      color: white;
      margin: 0;
      padding: 1rem 1.5rem;
      font-size: 1.1rem;
      font-weight: 600;
      border-bottom: 1px solid var(--border);
      border-radius: 0.5rem 0.5rem 0 0;
    }

    &__content {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      z-index: 1;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      
      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      label {
        display: block;
        margin-bottom: 0.25rem;
        font-weight: 600;
        font-size: 0.95rem;
        color: var(--text);
      }

      label.required::after {
        content: ' *';
        color: #dc2626;
        font-weight: bold;
      }

      .form-control {
        padding: 0.75rem;
        border: 1px solid var(--border);
        border-radius: 0.5rem;
        font-size: 0.95rem;
        background: var(--bg);
        color: var(--text);
        transition: all 0.2s ease;

        &:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
        }

        &::placeholder {
          color: var(--text-light);
        }
      }

      textarea.form-control {
        min-height: 80px;
        resize: vertical;
        font-family: inherit;
      }

      select.form-control {
        cursor: pointer;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
        background-position: right 0.5rem center;
        background-repeat: no-repeat;
        background-size: 1.5em 1.5em;
        padding-right: 2.5rem;
      }

      .category-input {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .image-upload {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .image-select {
          margin-bottom: 0.5rem;
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e") !important;
          background-position: right 0.5rem center !important;
          background-repeat: no-repeat !important;
          background-size: 1.5em 1.5em !important;
          padding-right: 2.5rem !important;
        }

        .image-input {
          padding: 0.5rem;
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          background: var(--bg);
          color: var(--text);
        }
      }
    }

    .image-preview-container {
      margin-top: 0.5rem;
      display: flex;
      justify-content: center;
      
      .img-preview {
        max-width: 200px;
        max-height: 150px;
        border-radius: 0.5rem;
        border: 2px solid var(--border);
        object-fit: cover;
      }
    }

    .gallery-previews {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 0.75rem;
      margin-top: 0.75rem;

      .gallery-item {
        position: relative;
        border-radius: 0.5rem;
        overflow: hidden;
        border: 2px solid var(--border);

        .img-preview {
          width: 100%;
          height: 100px;
          object-fit: cover;
          display: block;
        }

        .gallery-remove-btn {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          background: rgba(220, 38, 38, 0.9);
          border: none;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background: rgb(220, 38, 38);
            transform: scale(1.1);
          }
        }
      }
    }

    .specs-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 0.5rem;
      overflow: visible !important;

      td {
        padding: 0.5rem;
        vertical-align: top;

        &:last-child {
          width: 50px;
          text-align: center;
        }
      }

      .spec-input-container {
        position: relative;
        width: 100%;

        .form-control {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid var(--border);
          border-radius: 0.25rem;
          font-size: 0.9rem;
          background: var(--bg);
          color: var(--text);

          &:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
          }
        }
      }
    }

    .edit-section--actions {
      background: var(--bg);
      border: 1px solid var(--primary);
      
      .edit-section__title {
        background: var(--primary);
        border-radius: 0.5rem;
      }
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

    .edit-section {
      background: var(--bg-light);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      margin-bottom: 1.5rem;
      overflow: visible !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

      &__title {
        background: var(--primary);
        color: white;
        margin: 0;
        padding: 1rem 1.5rem;
        font-size: 1.1rem;
        font-weight: 600;
        border-bottom: 1px solid var(--border);
        border-radius: 0.5rem 0.5rem 0 0;
      }

      &__content {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        z-index: 1;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        
        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        label {
          display: block;
          margin-bottom: 0.25rem;
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text);
        }

        .form-control {
          padding: 0.75rem;
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          font-size: 0.95rem;
          background: var(--bg);
          color: var(--text);
          transition: all 0.2s ease;

          &:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
          }

          &::placeholder {
            color: var(--text-light);
          }
        }

        textarea.form-control {
          min-height: 80px;
          resize: vertical;
          font-family: inherit;
        }

        select.form-control {
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
        }
      }

      .image-upload {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .image-select {
          margin-bottom: 0.5rem;
        }

        .image-input {
          padding: 0.5rem;
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          background: var(--bg);
          color: var(--text);
        }
      }

      .image-preview-container {
        margin-top: 0.5rem;
        display: flex;
        justify-content: center;
        
        .img-preview {
          max-width: 200px;
          max-height: 150px;
          border-radius: 0.5rem;
          border: 2px solid var(--border);
          object-fit: cover;
        }
      }

      .gallery-previews {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 0.75rem;
        margin-top: 0.75rem;

        .gallery-item {
          position: relative;
          border-radius: 0.5rem;
          overflow: hidden;
          border: 2px solid var(--border);

          .img-preview {
            width: 100%;
            height: 100px;
            object-fit: cover;
            display: block;
          }

          .gallery-remove-btn {
            position: absolute;
            top: 0.25rem;
            right: 0.25rem;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            background: rgba(220, 38, 38, 0.9);
            border: none;
            color: white;
            cursor: pointer;
            transition: all 0.2s ease;

            &:hover {
              background: rgb(220, 38, 38);
              transform: scale(1.1);
            }
          }
        }
      }

      .specs-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 0.5rem;
        overflow: visible !important;

        td {
          padding: 0.5rem;
          vertical-align: top;

          &:last-child {
            width: 50px;
            text-align: center;
          }
        }

        .spec-input-container {
          position: relative;
          width: 100%;

          .form-control {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid var(--border);
            border-radius: 0.25rem;
            font-size: 0.9rem;
            background: var(--bg);
            color: var(--text);

            &:focus {
              outline: none;
              border-color: var(--primary);
              box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
            }
          }
        }
      }

      .prod-details__actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        padding-top: 1rem;
        border-top: 1px solid var(--border);
        margin-top: 1rem;

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          transition: all 0.2s ease;
          cursor: pointer;
          border: none;
          font-size: 0.95rem;
          min-width: 120px;

          &.btn-primary {
            background: var(--primary);
            color: white;

            &:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
            }

            &:active {
              transform: translateY(0);
              box-shadow: 0 2px 6px rgba(var(--primary-rgb), 0.3);
            }
          }

          &.btn-secondary {
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;

            &:hover {
              background: #e5e7eb;
              border-color: #9ca3af;
              transform: translateY(-1px);
            }

            &:active {
              transform: translateY(0);
            }
          }

          &.btn-danger {
            background: #dc2626;
            color: white;

            &:hover {
              background: #b91c1c;
              transform: translateY(-1px);
            }

            &:active {
              transform: translateY(0);
            }
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

/* Стили для системы подсказок характеристик */
.quick-specs-copy {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--bg-light);
  border-radius: 0.5rem;
  border: 1px solid var(--border);
}

.quick-specs-copy label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text);
}

.copy-controls {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.copy-controls .form-control {
  flex: 1;
  min-width: 200px;
  z-index: 99999;
  position: relative;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
}

.copy-controls .btn {
  white-space: nowrap;
}

.preview-specs {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
}

.preview-specs h4 {
  margin: 0 0 1rem 0;
  color: var(--text);
  font-size: 1rem;
}

.preview-specs-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.preview-spec-item {
  padding: 0.5rem;
  background: var(--bg-light);
  border-radius: 0.25rem;
  font-size: 0.9rem;
  border-left: 3px solid var(--primary);
}

.preview-power,
.preview-fuels {
  padding: 0.5rem;
  background: var(--bg-light);
  border-radius: 0.25rem;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  border-left: 3px solid var(--accent);
}

.spec-input-container {
  position: relative;
  width: 100%;
}

.spec-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 99999;
  max-height: 200px;
  overflow-y: auto;
}

.spec-suggestion-item {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid var(--border-light);
  font-size: 0.9rem;

  &:hover {
    background-color: var(--primary-light);
    color: var(--primary);
  }

  &:last-child {
    border-bottom: none;
  }
}

.spec-suggestion-item:active {
  background-color: var(--primary);
  color: white;
}

/* Анимация появления подсказок */
.spec-suggestions {
  animation: fadeInUp 0.2s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Улучшения для таблицы характеристик */
.specs-table {
  .spec-input-container input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--secondary);
    border-radius: 0.25rem;
    font-size: 0.9rem;
    margin-bottom: 0;
    transition: border-color 0.2s ease;

    &:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
    }
  }
}

.edit-section select,
.edit-section .form-control,
.image-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

.copy-controls select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  font-size: 0.95rem;
  color: var(--text);
  min-width: 200px;
}

.spec-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18), 0 1.5px 6px rgba(0,0,0,0.08);
  border: 1.5px solid #e5e7eb;
  z-index: 99999 !important;
  max-height: 200px;
  overflow-y: auto;
}

.btn.btn-primary:disabled {
  background: #9ca3af !important;
  color: #fff !important;
  cursor: not-allowed !important;
  opacity: 0.7 !important;
  box-shadow: none !important;
}
</style> 