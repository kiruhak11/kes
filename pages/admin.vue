<template>
  <section class="admin-section container">
    <!-- Вход в админ-панель -->
    <div v-if="!authorized" class="login-box">
      <h2>Вход в админ-панель</h2>
      <input
        v-model="password"
        type="password"
        placeholder="Пароль"
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
        <select v-model="newProd.image">
          <option
            v-for="img in presetImages"
            :key="img"
            :value="img"
          >
            {{ img.split('/').pop() }}
          </option>
        </select>
        <img
          v-if="newProd.image"
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
              <select v-model="p.image">
                <option
                  v-for="img in presetImages"
                  :key="img"
                  :value="img"
                >
                  {{ img.split('/').pop() }}
                </option>
              </select>
              <img
                v-if="p.image"
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
import { ref, reactive, onMounted } from 'vue'
import { useRuntimeConfig } from '#app'

interface Product {
  id: number
  name: string
  description: string
  extendedDescription?: string
  price: number
  image?: string
  specs?: Record<string,string>
}

const config = useRuntimeConfig().public
const password = ref('')
const loginError = ref<string|null>(null)
const authorized = ref(false)

const products = ref<Product[]>([])
const newProd = reactive<Partial<Product>>({
  name: '',
  description: '',
  extendedDescription: '',
  price: 0,
  image: ''
})
const activeId = ref<number|null>(null)

// Характеристики
const specsList = reactive<Record<number, Array<{key:string,value:string}>>>({})
const newSpecs = reactive<Array<{key:string,value:string}>>([])
const newSpec = reactive<{ key:string, value:string }>({ key:'', value:'' })

// Предзаготовленные картинки
const presetImages = [
  '/images/cutouts/kotel1.png',
  '/images/cutouts/kotel2.png',
  '/images/cutouts/kotel3.png'
]

async function loadProducts() {
  products.value = await $fetch<Product[]>('/api/products')
  products.value.forEach(p => {
    specsList[p.id] = Object.entries(p.specs||{}).map(([k,v])=>({key:k,value:v}))
  })
}

function login() {
  if (password.value === config.adminPassword) {
    authorized.value = true
    loadProducts()
  } else {
    loginError.value = 'Неправильный пароль'
  }
}

async function addProduct() {
  if (!newProd.name || !newProd.description || !newProd.price) return
  const specs: Record<string,string> = {}
  newSpecs.forEach(s=> specs[s.key]=s.value)
  const added = await $fetch<Product>('/api/products', {
    method: 'POST',
    body: { ...newProd, specs }
  })
  products.value.push(added)
  specsList[added.id] = newSpecs.slice()
  newProd.name = ''
  newProd.description = ''
  newProd.extendedDescription = ''
  newProd.price = 0
  newProd.image = ''
  newSpecs.splice(0)
}

function toggle(id:number) {
  activeId.value = activeId.value === id ? null : id
}

async function updateWithSpecs(p:Product) {
  let specs: Record<string,string> = {}
  specsList[p.id].forEach(s=> specs[s.key]=s.value)
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
  specsList[id].push({ key:'', value:'' })
}

function removeSpec(id:number, idx:number) {
  specsList[id].splice(idx,1)
}

function addNewSpec() {
  if (newSpec.key && newSpec.value) {
    newSpecs.push({ key:newSpec.key, value:newSpec.value })
    newSpec.key = ''
    newSpec.value = ''
  }
}

function removeNewSpec(idx:number) {
  newSpecs.splice(idx,1)
}

async function deleteProduct(id:number) {
  await $fetch(`/api/products/${id}`, { method:'DELETE' })
  products.value = products.value.filter(x=>x.id!==id)
  delete specsList[id]
}
</script>

<style lang="scss" scoped>
.admin-section {
  padding: 4rem 0;

  .login-box {
    max-width: 320px;
    margin: auto;
    text-align: center;

    input {
      width: 100%;
      margin: .5rem 0;
      padding: .5rem;
    }

    .error {
      color: red;
      margin-top: .5rem;
    }
  }

  .catalog-manager {
    .add-form {
      display: flex;
      flex-wrap: wrap;
      gap: .5rem;
      margin-bottom: 1.5rem;

      input,
      textarea,
      select {
        padding: .5rem;
        border: 1px solid var(--secondary);
        border-radius: .25rem;
        flex: 1 1 200px;
      }

      .img-preview {
        width: 60px;
        height: 60px;
        object-fit: contain;
        margin-left: .5rem;
      }
    }

    .specs-table {
      width: 100%;
      border-collapse: collapse;
      margin: .5rem 0;

      td {
        border: 1px solid var(--secondary);
        padding: .25rem;
      }
    }

    .prod-list {
      .prod-item {
        border: 1px solid var(--secondary);
        border-radius: .5rem;
        margin-bottom: 1rem;
        overflow: hidden;

        .prod-summary {
          display: flex;
          align-items: center;
          padding: .75rem 1rem;
          background: var(--secondary);
          color: var(--bg);
          cursor: pointer;

          &__id { width: 40px; }
          &__name { flex: 1; }
          &__price { width: 100px; text-align: right; }
          &__delete { margin-left: 1rem; }
          &:hover { background: var(--accent); }
        }

        .prod-details {
          background: var(--bg);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: .75rem;

          label {
            display: flex;
            flex-direction: column;
            font-weight: 500;
          }

          input, textarea, select {
            width: 100%;
            padding: .5rem;
            border: 1px solid var(--secondary);
            border-radius: .25rem;
          }

          .prod-details__actions {
            display: flex;
            gap: .5rem;
            margin-top: .5rem;
          }
        }
      }

      /* Анимация разворачивания */
      .slide-enter-active,
      .slide-leave-active {
        transition: max-height .3s ease, opacity .3s ease;
      }
      .slide-enter-from,
      .slide-leave-to {
        max-height: 0;
        opacity: 0;
      }
      .slide-enter-to,
      .slide-leave-from {
        max-height: 500px;
        opacity: 1;
      }
    }
  }
}
</style>
