<template>
  <section class="admin-section container">
    <div v-if="!authorized" class="login-box">
      <h2>Вход в админ-панель</h2>
      <input v-model="password" type="password" placeholder="Пароль" />
      <button class="btn btn-primary" @click="login">Войти</button>
      <p v-if="loginError" class="error">{{ loginError }}</p>
    </div>

    <div v-else class="catalog-manager">
      <h1>Управление каталогом</h1>

      <!-- Форма добавления -->
      <div class="form-group add-form">
        <input v-model="newProd.name" placeholder="Название" />
        <input
          v-model.number="newProd.price"
          placeholder="Цена"
          type="number"
        />
        <input v-model="newProd.description" placeholder="Описание" />
        <button class="btn btn-secondary" @click="addProduct">Добавить</button>
      </div>

      <!-- Список и редактирование -->
      <table class="prod-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Цена</th>
            <th>Описание</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in products" :key="p.id">
            <td>{{ p.id }}</td>
            <td><input v-model="p.name" /></td>
            <td><input v-model.number="p.price" type="number" /></td>
            <td><input v-model="p.description" /></td>
            <td>
              <button class="btn btn-primary" @click="updateProduct(p)">
                Сохранить
              </button>
              <button class="btn btn-danger" @click="deleteProduct(p.id)">
                Удалить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRuntimeConfig } from "#app";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
}

const config = useRuntimeConfig().public;
const password = ref("");
const loginError = ref<string | null>(null);
const authorized = ref(false);

const products = ref<Product[]>([]);
const newProd = reactive<Partial<Product>>({
  name: "",
  description: "",
  price: 0,
});

async function load() {
  products.value = await $fetch<Product[]>("/api/products");
}

function login() {
  if (password.value === config.adminPassword) {
    authorized.value = true;
    load();
  } else {
    loginError.value = "Неправильный пароль";
  }
}

async function addProduct() {
  if (!newProd.name || !newProd.description || newProd.price! <= 0) return;
  const added = await $fetch<Product>("/api/products", {
    method: "POST",
    body: newProd,
  });
  products.value.push(added);
  newProd.name = "";
  newProd.description = "";
  newProd.price = 0;
}

async function updateProduct(p: Product) {
  await $fetch<Product>(`/api/products/${p.id}`, {
    method: "PUT",
    body: { name: p.name, price: p.price, description: p.description },
  });
  // можно показать уведомление
}

async function deleteProduct(id: number) {
  await $fetch<Product>(`/api/products/${id}`, { method: "DELETE" });
  products.value = products.value.filter((x) => x.id !== id);
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
      margin: 0.5rem 0;
      padding: 0.5rem;
    }
  }
  .error {
    color: red;
  }

  .catalog-manager {
    .add-form {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      input {
        flex: 1;
        padding: 0.5rem;
      }
    }
    .prod-table {
      width: 100%;
      border-collapse: collapse;
      th,
      td {
        border: 1px solid var(--secondary);
        padding: 0.5rem;
      }
      input {
        width: 100%;
      }
      .btn {
        margin-right: 0.25rem;
      }
    }
  }
}
</style>
