<template>
  <section class="admin-section container">
    <!-- Вкладки -->
    <div class="admin-tabs" v-scroll-reveal="'fade-in-up'">
      <button
        :class="{ active: adminTab === 'catalog' }"
        @click="adminTab = 'catalog'"
      >
        Каталог
      </button>
      <button
        :class="{ active: adminTab === 'filters' }"
        @click="adminTab = 'filters'"
      >
        Фильтры
      </button>
      <button
        :class="{ active: adminTab === 'categories' }"
        @click="adminTab = 'categories'"
      >
        Категории
      </button>
      <button
        :class="{ active: adminTab === 'stats' }"
        @click="adminTab = 'stats'"
      >
        Статистика
      </button>
    </div>

    <!-- Добавляем кнопку бэкапа -->
    <div v-if="authorized" class="admin-actions">
      <button
        class="backup-btn"
        @click="downloadBackup"
        :disabled="isBackupInProgress"
      >
        {{
          isBackupInProgress
            ? "Создание бэкапа..."
            : "Скачать бэкап базы данных"
        }}
      </button>
    </div>

    <AdminCatalog
      v-if="adminTab === 'catalog'"
      :admin-tab="adminTab"
      :authorized="authorized"
      :password="password"
      :login-error="loginError"
      @update:password="(...args: any[]) => (password = args[0])"
      @login="login"
      @logout="logout"
      :products="normalizedProducts"
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
      :set-show-in-filters-for-all="setShowInFiltersForAll"
      @add-product="(...args: any[]) => addProduct()"
      @reset-form="(...args: any[]) => resetForm()"
      @toggle="(...args: any[]) => toggle(args[0])"
      @update-with-specs="(...args: any[]) => updateWithSpecs(args[0])"
      @cancel-edit="(...args: any[]) => cancelEdit()"
      @add-spec="(...args: any[]) => addSpec(args[0])"
      @remove-spec="(...args: any[]) => removeSpec(args[0], args[1])"
      @add-new-spec="(...args: any[]) => addNewSpec()"
      @remove-new-spec="(...args: any[]) => removeNewSpec(args[0])"
      @delete-product="(...args: any[]) => deleteProduct(args[0])"
      @handle-image-upload="
        (...args: any[]) => handleImageUpload(args[0], args[1])
      "
      @handle-connection-scheme-upload="
        (...args: any[]) => handleConnectionSchemeUpload(args[0], args[1])
      "
      @toggle-new-prod-fuel-dropdown="
        (...args: any[]) => toggleNewProdFuelDropdown()
      "
    />

    <AdminFilters
      v-if="adminTab === 'filters'"
      :products="normalizedProducts"
      :specs-list="specsList"
      :categories="categories"
    />
    <AdminCategories
      v-if="adminTab === 'categories' && authorized"
      :categories="categories"
      :products="normalizedProducts"
      :new-category="newCategory"
      :editing-category="editingCategory"
      :show-add-category-modal="showAddCategoryModal"
      :show-edit-category-modal="showEditCategoryModal"
      :modal-store="modalStore"
      :is-deleting="isDeletingEmptyCategories"
      @add-category="(...args: any[]) => addCategory()"
      @edit-category="(...args: any[]) => editCategory(args[0])"
      @save-category="(...args: any[]) => saveCategory()"
      @delete-category="(...args: any[]) => deleteCategory(args[0])"
      @delete-empty-categories="(...args: any[]) => deleteEmptyCategories()"
      @close-edit-category-modal="(...args: any[]) => closeEditCategoryModal()"
      @update:new-category="(...args: any[]) => (newCategory = args[0])"
      @update:editing-category="(...args: any[]) => (editingCategory = args[0])"
      @update:show-add-category-modal="
        (...args: any[]) => (showAddCategoryModal = args[0])
      "
      @update:show-edit-category-modal="
        (...args: any[]) => (showEditCategoryModal = args[0])
      "
      :get-category-product-count="getCategoryProductCount"
    />
    <AdminStats
      v-if="adminTab === 'stats' && authorized"
      :stats="stats"
      :loading="loading"
      :error="error || ''"
      :visits="visits"
      :requests="requests"
      :selected-request="selectedRequest"
      @fetch-stats="(...args: any[]) => fetchStats()"
      @show-request-details="(...args: any[]) => showRequestDetails(args[0])"
      @close-request-details="(...args: any[]) => closeRequestDetails()"
      @delete-request="(...args: any[]) => deleteRequest(args[0])"
      @delete-all-requests="(...args: any[]) => deleteAllRequests()"
    />
    <UiLog v-if="!authorized && adminTab !== 'catalog'" class="log" />
  </section>
</template>

<script setup lang="ts">
import AdminCatalog from "~/components/AdminCatalog.vue";
import AdminCategories from "~/components/AdminCategories.vue";
import AdminStats from "~/components/AdminStats.vue";
import AdminFilters from "~/components/AdminFilters.vue";
import { ref, onMounted, watch, h, computed } from "vue";
import { useStats } from "~/composables/useStats";
import { useModalStore } from "~/stores/modal";
import { useFileStorage } from "~/composables/useFileStorage";
import {
  convertSpecsToCharacteristics,
  convertCharacteristicsToSpecs,
} from "~/utils/characteristics";
import type {
  Product,
  AdminProduct,
  NewProduct,
  Category,
  CategoryApiResponse,
  ProductApiResponse,
  Characteristic,
} from "~/types/product";
import { useHead } from "nuxt/app";
import Chart from "chart.js/auto";
const { setModal, closeModal, clearModals, isOpen } = useFrogModal();
// Добавляем объявление переменной chart
let chart: Chart | null = null;

const transliterate = (text: string): string => {
  const mapping: { [key: string]: string } = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "yo",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "kh",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",
    А: "A",
    Б: "B",
    В: "V",
    Г: "G",
    Д: "D",
    Е: "E",
    Ё: "Yo",
    Ж: "Zh",
    З: "Z",
    И: "I",
    Й: "Y",
    К: "K",
    Л: "L",
    М: "M",
    Н: "N",
    О: "O",
    П: "P",
    Р: "R",
    С: "S",
    Т: "T",
    У: "U",
    Ф: "F",
    Х: "Kh",
    Ц: "Ts",
    Ч: "Ch",
    Ш: "Sh",
    Щ: "Sch",
    Ъ: "",
    Ы: "Y",
    Ь: "",
    Э: "E",
    Ю: "Yu",
    Я: "Ya",
  };
  return text
    .split("")
    .map((char) => mapping[char] || char)
    .join("");
};

interface Spec {
  id: number;
  key: string;
  value: string;
  show_in_filters?: boolean;
  showKeySuggestions?: boolean;
  showValueSuggestions?: boolean;
}

type AdminCategory = Category;

interface Request {
  id: number;
  type: string;
  phone: string;
  region?: string;
  type_building?: string;
  fuel_type?: string;
  power_type?: string;
  status: string;
  raw_text?: string;
  created_at: string;
}

interface Stats {
  visits: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  requests: {
    list: Request[];
    stats: Record<string, number>;
  };
}

const config = useRuntimeConfig();
const password = ref("");
const loginError = ref<string | null>(null);
const authorized = ref(false);
const products = ref<Product[]>([]);

// Функция для генерации slug
function generateSlug(text: string): string {
  return transliterate(text)
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Computed свойство для нормализации продуктов с правильными типами
const normalizedProducts = computed(() => {
  return products.value.map((p) => ({
    ...p,
    category: p.category || "",
    category_name: p.category_name || p.category || "",
    category_slug: p.category_slug || "",
    slug: p.slug || generateSlug(p.name || ""),
  }));
});
const categories = ref<AdminCategory[]>([]);
const specsList = ref<Record<number, Spec[]>>({});
const newProd = ref<NewProduct>({
  name: "",
  description: "",
  extendedDescription: "",
  price: 0,
  image: "",
  category: "",
  delivery_set: "",
  connection_scheme: "",
  additional_requirements: "",
  required_products: [],
});
const newCategory = ref({
  name: "",
  description: "",
  slug: "",
});
const activeId = ref<number | null>(null);

// Характеристики
const newSpecs = ref<Spec[]>([]);
const newSpec = ref<Spec>({
  id: 1,
  key: "",
  value: "",
  show_in_filters: false,
});

// Новые реактивные переменные для мощности и топлива
const newProdPowerValue = ref();
const newProdPowerUnit = ref("");
const newProdSelectedFuels = ref([]);
const showNewProdFuelDropdown = ref(false);

// Доступные единицы измерения мощности
const powerUnits = ["МВт", "кВт", "Гкал/ч"];

// Доступные виды топлива
const availableFuels = [
  "Природный газ",
  "Дизельное топливо",
  "Мазут",
  "Уголь",
  "Биомасса",
  "Электричество",
];

// Предзаготовленные картинки
const presetImages = [
  "/images/cutouts/kotel1.png",
  "/images/cutouts/dimosos_pered.png",
  "/images/cutouts/dimosos_zad.png",
  "/images/cutouts/kva_gaz.png",
  "/images/cutouts/kva_ygol.png",
  "/images/cutouts/tchzm.png",
  "/images/cutouts/tlph.png",
  "/images/cutouts/TSHPM.png",
  "/images/cutouts/ciklon1.png",
  "/images/cutouts/cn15.png",
  "/images/cutouts/skip11.png",
  "/images/cutouts/tc2-28.png",
  "/images/cutouts/ts2-30.png",
  "/images/cutouts/zoloyl1.png",
  "/images/cutouts/zoloyl2.png",
  "/images/cutouts/emma_diz.png",
  "/images/cutouts/emma.png",
  "/images/cutouts/g_sib_strong.png",
  "/images/cutouts/gorelka_baltur_diz.jpg.png",
  "/images/cutouts/gorelka_eco_gaz.png",
  "/images/cutouts/gorelka_maslo.png",
  "/images/cutouts/gorelka_rgmg.png",
];

// add after newProdSelectedFuels definitions
const newProdGallery = ref<string[]>([]);

// Глобальная переменная для refreshProducts
let refreshProducts: (() => Promise<void>) | null = null;

// Функция для загрузки данных
async function loadData() {
  // First load categories
  const { data: fetchedCategories, error: categoriesFetchError } =
    await useFetch<CategoryApiResponse>("/api/categories");

  if (fetchedCategories.value?.categories) {
    categories.value = fetchedCategories.value.categories.map((cat) => ({
      id: String(cat.id),
      name: cat.name,
      description: cat.description ?? "",
      slug: cat.slug,
    }));
  } else {
    console.error("No categories data received");
    categories.value = [];
  }

  if (categoriesFetchError.value) {
    console.error(
      "Error fetching categories for admin:",
      categoriesFetchError.value
    );
    categories.value = [];
  }

  // Then load products
  const {
    data: fetchedProducts,
    error: productsFetchError,
    refresh: refreshProductsFn,
  } = await useFetch<any>("/api/products", {
    query: {
      categorySlug: "all",
    },
    transform: (response) => {
      if (
        !response ||
        !response.products ||
        !Array.isArray(response.products)
      ) {
        console.error("Invalid response format:", response);
        return [];
      }
      return response.products;
    },
  });

  if (fetchedProducts.value) {
    products.value = fetchedProducts.value.map((product: Product) => {
      // Find the category name from the category ID or slug
      const category = categories.value.find(
        (c) =>
          c.id === String(product.category_id) ||
          c.slug === product.category_slug
      );

      // Конвертируем старый формат specs в новый формат characteristics
      const characteristics = convertSpecsToCharacteristics(
        product.specs as Record<string, any>
      );

      return {
        ...product,
        category: category?.name || product.category || "",
        category_name: category?.name || product.category || "",
        slug: generateSlug(product.name || ""),
        specs: characteristics,
        additional_requirements: product.additional_requirements || "",
        required_products: product.required_products || [],
        description: product.description ?? "",
        extendedDescription: product.extendedDescription ?? "",
        price:
          typeof product.price === "number"
            ? product.price
            : Number(product.price) || 0,
        image: product.image ?? "",
        category_id: product.category_id,
        category_slug: product.category_slug,
      };
    });
  } else {
    console.error("No products data received");
    products.value = [];
  }

  if (productsFetchError.value) {
    console.error(
      "Error fetching products for admin:",
      productsFetchError.value
    );
    products.value = [];
  }

  // Присваиваем refreshProducts глобальной переменной
  refreshProducts = refreshProductsFn;
}

// Загружаем данные при инициализации
loadData();

// Update specsList after products are loaded
watch(
  products,
  (newProducts) => {
    if (Array.isArray(newProducts)) {
      newProducts.forEach((p) => {
        // Инициализируем specsList только если его еще нет для этого продукта
        if (!specsList.value[p.id]) {
          specsList.value[p.id] = (p.specs || []).map((spec) => ({
            id: spec.id,
            key: spec.key,
            value: spec.value,
            show_in_filters: (spec as any).show_in_filters || false,
            showKeySuggestions: false,
            showValueSuggestions: false,
          }));
        }
      });
    }
  },
  { immediate: true }
);

// Валидация формы
const isFormValid = computed(() => {
  const valid =
    newProd.value.name &&
    newProd.value.description &&
    newProd.value.price > 0 &&
    ((newProd.value.category && newProd.value.category !== "new") ||
      (newProd.value.category === "new" && newCategory.value.name));

  return valid;
});

function validateNewCategory() {
  if (
    newCategory.value.name &&
    categories.value.some((c) => c.name === newCategory.value.name)
  ) {
    newProd.value.category = newCategory.value.name;
    newCategory.value.name = "";
  }
}

// Функция generateSlug уже определена выше
const modalStore = useModalStore();
// Обновляем функцию addProduct
async function addProduct() {
  try {
    // Проверяем валидность формы
    if (!isFormValid.value) {
      console.error("Form validation failed");
      return;
    }

    let categoryId: string | null = null;
    let categorySlug: string = "";
    let categoryName: string = "";

    // Если выбрана новая категория, сначала создаем её
    if (newProd.value.category === "new") {
      const categoryResponse = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCategory.value.name,
          description: newCategory.value.description,
          slug: generateSlug(newCategory.value.name),
        }),
      });

      if (!categoryResponse.ok) {
        const errorData = await categoryResponse.json();
        if (categoryResponse.status === 409) {
          // Категория уже существует, используем существующую
          const existingCategory = categories.value.find(
            (c) => c.name === newCategory.value.name
          );
          if (existingCategory) {
            categoryId = existingCategory.id;
            categorySlug = existingCategory.slug;
            categoryName = existingCategory.name;
          } else {
            throw new Error(
              "Category already exists but not found in local list"
            );
          }
        } else {
          throw new Error(
            errorData.statusMessage || "Failed to create category"
          );
        }
      } else {
        const { category: newCategoryData } = await categoryResponse.json();
        categoryId = newCategoryData.id;
        categorySlug = newCategoryData.slug;
        categoryName = newCategoryData.name;

        // Добавляем новую категорию в список
        categories.value.push({
          id: String(newCategoryData.id),
          name: newCategoryData.name,
          description: newCategoryData.description ?? "",
          slug: newCategoryData.slug,
        });

        // Обновляем список категорий
        const { data: updatedCategories } = await useFetch<{
          categories: Category[];
        }>("/api/categories");
        if (updatedCategories.value?.categories) {
          categories.value = updatedCategories.value.categories.map((cat) => ({
            id: String(cat.id),
            name: cat.name,
            description: cat.description ?? "",
            slug: cat.slug,
          }));
        }
      }
    } else {
      // Находим существующую категорию
      const category = categories.value.find(
        (c) => c.name === newProd.value.category
      );
      if (!category) {
        throw new Error("Category not found");
      }
      categoryId = category.id;
      categorySlug = category.slug;
      categoryName = category.name;
    }

    // Подготовка характеристик
    const characteristics = newSpecs.value.map((spec) => ({
      id: spec.id,
      key: spec.key,
      value: spec.value,
      show_in_filters: spec.show_in_filters || false,
    }));

    // Создаем объект продукта для отправки
    const productData = {
      name: newProd.value.name,
      description: newProd.value.description,
      extendedDescription: newProd.value.extendedDescription || "",
      price: Number(newProd.value.price),
      image: newProd.value.image || "/images/placeholders/placeholder.png",
      category_id: categoryId,
      specs: characteristics,
      additional_images: newProdGallery.value,
      delivery_set: newProd.value.delivery_set || null,
      connection_scheme: newProd.value.connection_scheme || null,
      additional_requirements: newProd.value.additional_requirements || null,
      required_products: newProd.value.required_products || [],
    };

    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.statusMessage || "Failed to create product");
    }

    const { product: newProduct } = await response.json();

    // Добавляем продукт в список с правильными данными категории
    if (products.value) {
      products.value.push({
        ...newProduct,
        category: newProduct.category_name || "",
      });
    }

    // Очищаем форму
    resetForm();

    // Небольшая задержка для обновления базы данных
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Обновляем список продуктов
    if (refreshProducts) {
      await refreshProducts();
    }

    // Принудительно обновляем specsList для всех продуктов
    if (products.value) {
      products.value.forEach((p) => {
        specsList.value[p.id] = (p.specs || []).map((spec) => ({
          id: spec.id,
          key: spec.key,
          value: spec.value,
          show_in_filters: (spec as any).show_in_filters || false,
          showKeySuggestions: false,
          showValueSuggestions: false,
        }));
      });
    }

    // Показываем сообщение об успехе
    modalStore.showSuccess("Товар успешно добавлен");
  } catch (error: any) {
    console.error("Error creating product:", error);
    modalStore.showError(`Ошибка при создании товара: ${error.message}`);
  }
}

// Функция очистки формы
const resetForm = () => {
  newProd.value = {
    name: "",
    description: "",
    extendedDescription: "",
    price: 0,
    image: "",
    category: "",
    delivery_set: "",
    connection_scheme: "",
    additional_requirements: "",
    required_products: [],
  };
  newCategory.value = {
    name: "",
    description: "",
    slug: "",
  };
  newSpecs.value = [];
  newProdPowerValue.value = undefined;
  newProdPowerUnit.value = "";
  newProdSelectedFuels.value = [];
  newProdGallery.value = [];
};

function toggle(id: number) {
  activeId.value = activeId.value === id ? null : id;
  if (activeId.value === id) {
    const productToEdit = products.value.find((p) => p.id === id);
    if (productToEdit) {
      // Устанавливаем текущую категорию
      if (productToEdit.category_name) {
        productToEdit.category = productToEdit.category_name;
      }

      // Обновляем specsList для редактируемого продукта, включая все характеристики
      specsList.value[id] = (productToEdit.specs || []).map((spec) => ({
        id: spec.id,
        key: spec.key,
        value: spec.value,
        show_in_filters: (spec as any).show_in_filters || false,
        showKeySuggestions: false,
        showValueSuggestions: false,
      }));
    }
  }
}

// Обновляем функцию updateWithSpecs
async function updateWithSpecs(p: Product) {
  try {
    // Сохраняем флаг keepOpen
    const keepOpen = (p as any).keepOpen;

    // Находим категорию
    const category = categories.value.find((c) => c.name === p.category);
    if (!category) {
      console.error("Category not found:", p.category);
      return;
    }

    // Подготовка характеристик
    const specs = Array.isArray(p.specs) ? p.specs : [];

    // Подготовка данных для обновления
    const updateData = {
      name: p.name,
      description: p.description,
      extendedDescription: p.extendedDescription || "",
      price: Number(p.price),
      image: p.image,
      category_id: category.id,
      specs: specs.filter((spec) => spec.key && spec.value), // Фильтруем пустые характеристики
      additional_images: p.additional_images || [],
      delivery_set: p.delivery_set || null,
      connection_scheme: p.connection_scheme || null,
      additional_requirements: p.additional_requirements || null,
      required_products: p.required_products || [],
    };

    // Получаем обновленный продукт с сервера
    const updatedProduct = await $fetch<ProductApiResponse>(
      `/api/products/${p.id}`,
      {
        method: "PUT",
        body: updateData,
      }
    );

    // Обновляем продукт в списке и specsList
    const productIndex = products.value.findIndex((prod) => prod.id === p.id);
    if (productIndex !== -1 && updatedProduct?.product) {
      products.value[productIndex] = {
        ...products.value[productIndex],
        ...updatedProduct.product,
      };

      // Обновляем specsList
      specsList.value[p.id] = updatedProduct.product.specs || [];
    }

    // Закрываем форму редактирования только если не указан флаг keepOpen
    if (!keepOpen) {
      activeId.value = null;
    }

    modalStore.showSuccess("Товар успешно обновлен");
  } catch (error) {
    console.error("Error updating product:", error);
    modalStore.showError("Ошибка при обновлении товара");
  }
}

function cancelEdit() {
  activeId.value = null;
}

function addSpec(id: number) {
  const newId =
    specsList.value[id].length > 0
      ? Math.max(...specsList.value[id].map((s) => s.id)) + 1
      : 1;

  specsList.value[id].push({
    id: newId,
    key: "",
    value: "",
    show_in_filters: false,
    showKeySuggestions: false,
    showValueSuggestions: false,
  });
}

// Функция удаления характеристики
async function removeSpec(productId: number, idx: number) {
  // Находим продукт
  const product = products.value.find((p) => p.id === productId);
  if (!product) return;

  // Удаляем характеристику из локального состояния
  specsList.value[productId].splice(idx, 1);

  // Создаем копию продукта с обновленными характеристиками
  const updatedProduct = {
    ...product,
    specs: specsList.value[productId],
  };

  // Обновляем продукт на сервере
  await updateWithSpecs({
    ...updatedProduct,
    keepOpen: true, // Оставляем форму редактирования открытой
  });
}

function addNewSpec() {
  if (newSpec.value.key && newSpec.value.value) {
    const newId =
      newSpecs.value.length > 0
        ? Math.max(...newSpecs.value.map((s) => s.id)) + 1
        : 1;

    newSpecs.value.push({
      id: newId,
      key: newSpec.value.key,
      value: newSpec.value.value,
      show_in_filters: newSpec.value.show_in_filters || false,
      showKeySuggestions: false,
      showValueSuggestions: false,
    });
    newSpec.value.key = "";
    newSpec.value.value = "";
    newSpec.value.show_in_filters = false;
  }
}

function removeNewSpec(idx: number) {
  newSpecs.value.splice(idx, 1);
}

async function deleteProduct(id: number) {
  const prodToDelete = products.value.find((x) => x.id === id);
  const cat = prodToDelete?.category;

  await $fetch(`/api/products/${id}`, { method: "DELETE" });
  products.value = products.value.filter((x) => x.id !== id);
  delete specsList.value[id];
}

// Импортируем новый composable для работы с файлами
const { uploadSingleFile, uploadFiles } = useFileStorage();

async function handleImageUpload(
  event: Event,
  product: Product | Partial<Product>
) {
  const input = event.target as HTMLInputElement;
  if (!input.files || !input.files[0]) return;

  const file = input.files[0];

  try {
    const filePath = await uploadSingleFile(file);
    product.image = filePath;
  } catch (error) {
    console.error("Error uploading image:", error);
  }
}

async function handleConnectionSchemeUpload(
  event: Event,
  product: Product | Partial<Product>
) {
  const input = event.target as HTMLInputElement;
  if (!input.files || !input.files[0]) return;

  const file = input.files[0];

  try {
    const filePath = await uploadSingleFile(file);
    product.connection_scheme = filePath;
  } catch (error) {
    console.error("Error uploading connection scheme image:", error);
  }
}

function toggleNewProdFuelDropdown() {
  showNewProdFuelDropdown.value = !showNewProdFuelDropdown.value;
}

// Возвращаем оригинальную функцию входа
function login() {
  if (password.value === config.public.adminPassword) {
    authorized.value = true;
  } else {
    loginError.value = "Неправильный пароль";
  }
}

function logout() {
  authorized.value = false;
  password.value = "";
  loginError.value = null;
  // Очищаем сохраненную авторизацию из localStorage
  if (process.client) {
    localStorage.removeItem("adminAuth");
  }
}

// Обновленная функция загрузки галереи
async function handleGalleryUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const files = Array.from(input.files);

  try {
    const filePaths = await uploadFiles(files);
    newProdGallery.value.push(...filePaths);
  } catch (error) {
    console.error("Error uploading gallery images:", error);
  }

  // clear input value for same file re-upload capability
  input.value = "";
}

function removeGalleryImage(idx: number) {
  newProdGallery.value.splice(idx, 1);
}

// Для редактирования галереи
function removeEditGalleryImage(p: Product, idx: number) {
  if (p.additional_images && Array.isArray(p.additional_images)) {
    p.additional_images.splice(idx, 1);
  }
}

// Обновленная функция загрузки галереи для редактирования
async function handleEditGalleryUpload(event: Event, p: Product) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const files = Array.from(input.files);

  // Инициализируем массив additional_images, если его нет
  if (!p.additional_images) {
    p.additional_images = [];
  }

  // Убеждаемся, что additional_images это массив
  if (!Array.isArray(p.additional_images)) {
    p.additional_images = [];
  }

  try {
    const filePaths = await uploadFiles(files);

    // Добавляем новые пути к существующим
    p.additional_images = [...p.additional_images, ...filePaths];
  } catch (error) {
    console.error("Error uploading gallery images:", error);
  }

  // Очищаем input
  input.value = "";
}

const adminTab = ref("catalog");

// Заменяем существующие переменные для статистики
const { visits, requests, loading, error, fetchVisits, fetchRequests } =
  useStats();

// Обновляем функцию renderChart
function renderChart() {
  if (!visits.value.length) return;
  const ctx = document.getElementById("visitsChart") as HTMLCanvasElement;
  if (!ctx) return;
  if (chart) chart.destroy();

  // Сортируем данные по дате
  const sortedVisits = [...visits.value].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Получаем последние 30 дней
  const last30Days = sortedVisits.slice(-30);

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: last30Days.map((v) => new Date(v.date).toLocaleDateString()),
      datasets: [
        {
          label: "Посещения",
          data: last30Days.map((v) => v.count),
          borderColor: "#007bff",
          backgroundColor: "rgba(0,123,255,0.1)",
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `Посещений: ${context.raw}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    },
  });
}

// Обновляем функцию fetchStats
async function fetchStats() {
  loading.value = true;
  error.value = null;
  try {
    // Получаем общую статистику
    const { data: statsData } = await useFetch<Stats>("/api/stats");
    if (statsData.value) {
      stats.value = {
        visits: statsData.value.visits,
        requests: {
          list: statsData.value.requests.list,
          stats: statsData.value.requests.stats || {},
        },
      };
    }

    // Получаем данные для графика
    const { data: visitsData } = await useFetch<{
      visits: { date: string; count: number }[];
    }>("/api/visits");
    if (visitsData.value?.visits) {
      visits.value = visitsData.value.visits;
      renderChart();
    }

    // Получаем список заявок
    const { data: requestsData } = await useFetch<{ requests: Request[] }>(
      "/api/requests"
    );
    if (requestsData.value?.requests) {
      // Группируем заявки по типу для статистики
      const requestStats = requestsData.value.requests.reduce(
        (acc: Record<string, number>, req) => {
          acc[req.type] = (acc[req.type] || 0) + 1;
          return acc;
        },
        {}
      );

      stats.value = {
        ...stats.value,
        requests: {
          list: requestsData.value.requests,
          stats: requestStats,
        },
      };
    }
  } catch (e) {
    error.value = "Failed to fetch statistics";
    console.error("Error fetching statistics:", e);
  } finally {
    loading.value = false;
  }
}

// Добавляем функцию для получения данных о посещениях
async function fetchVisitsData(): Promise<{ date: string; count: number }[]> {
  try {
    const { data } = await useFetch<{
      visits: { date: string; count: number }[];
    }>("/api/visits");
    return data.value?.visits || [];
  } catch (e) {
    console.error("Error fetching visits data:", e);
    return [];
  }
}

// Обновляем watch для adminTab
watch(adminTab, (tab) => {
  if (tab === "stats" && authorized.value) {
    fetchStats();
  }
});

// Обновляем onMounted
onMounted(() => {
  // Проверяем сохраненную авторизацию
  checkSavedAuth();

  if (adminTab.value === "stats" && authorized.value) {
    fetchStats();
  }
});

// Функция для проверки сохраненной авторизации
function checkSavedAuth() {
  if (process.client) {
    const savedAuth = localStorage.getItem("adminAuth");
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        if (authData.authorized && authData.timestamp) {
          // Проверяем, не истек ли срок действия (7 дней)
          const now = Date.now();
          const authTime = authData.timestamp;
          const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7 дней в миллисекундах

          if (now - authTime < sevenDays) {
            // Авторизация еще действительна
            authorized.value = true;
            return;
          } else {
            // Авторизация истекла, удаляем из localStorage
            localStorage.removeItem("adminAuth");
          }
        }
      } catch (error) {
        console.error("Error parsing saved auth data:", error);
        localStorage.removeItem("adminAuth");
      }
    }
  }
}

// Обновляем состояние для статистики
const stats = ref<Stats>({
  visits: {
    today: 0,
    week: 0,
    month: 0,
    total: 0,
  },
  requests: {
    list: [],
    stats: {},
  },
});

const selectedRequest = ref<Request | null>(null);

const showRequestDetails = (request: Request) => {
  selectedRequest.value = request;
};

const closeRequestDetails = () => {
  selectedRequest.value = null;
};

// Add this computed property in the script section
const filteredSpecs = computed(() => (id: number) => {
  const specs = specsList.value[id] ? [...specsList.value[id]] : [];
  // Сортируем характеристики по порядку добавления (по id)
  return specs.sort((a, b) => {
    // Если есть id, сортируем по ним
    if (typeof a.id === "number" && typeof b.id === "number") {
      return a.id - b.id;
    }
    // Если нет id, сохраняем текущий порядок
    return 0;
  });
});

const showCategoryDescriptionModal = ref(false);
function confirmCategoryDescription() {
  showCategoryDescriptionModal.value = false;
  // Продолжить создание категории и товара
}

// Функции для работы с категориями
const editingCategory = ref<any>(null);
const showAddCategoryModal = ref(false);
const showEditCategoryModal = ref(false);
const isDeletingEmptyCategories = ref(false);

// Функция для генерации slug из названия
watch(
  () => newCategory.value.name,
  (newName) => {
    if (newName) {
      newCategory.value.slug = transliterate(newName)
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    }
  }
);

// Добавление категории
async function addCategory() {
  try {
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newCategory.value.name,
        description: newCategory.value.description,
        slug: newCategory.value.slug,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create category");
    }

    const { category: newCategoryData } = await response.json();

    // Добавляем новую категорию в локальный список
    const newCategoryObject = {
      id: String(newCategoryData.id),
      name: newCategoryData.name,
      description: newCategoryData.description ?? "",
      slug: newCategoryData.slug,
    };

    categories.value.push(newCategoryObject);

    // Очищаем форму и закрываем модальное окно
    newCategory.value = {
      name: "",
      description: "",
      slug: "",
    };
    showAddCategoryModal.value = false;

    // Показываем сообщение об успехе
    modalStore.showSuccess("Категория успешно создана");
  } catch (error) {
    console.error("Error creating category:", error);
    modalStore.showError("Ошибка при создании категории");
  }
}

// Редактирование категории
function editCategory(category: AdminCategory) {
  editingCategory.value = { ...category };
  showEditCategoryModal.value = true;
}

// Сохранение изменений категории
async function saveCategory() {
  try {
    if (!editingCategory.value) {
      throw new Error("No category being edited");
    }

    const response = await fetch(
      `/api/categories/${editingCategory.value.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editingCategory.value.name,
          description: editingCategory.value.description ?? "",
          slug: editingCategory.value.slug,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.statusMessage || "Failed to update category");
    }

    const updatedCategory = await response.json();

    // Обновляем категорию в списке
    const index = categories.value.findIndex(
      (c) => c.id === editingCategory.value.id
    );
    if (index !== -1) {
      categories.value[index] = {
        id: updatedCategory.id,
        name: updatedCategory.name,
        slug: updatedCategory.slug,
        description: updatedCategory.description ?? "",
      };
    }

    closeEditCategoryModal();
    modalStore.showSuccess("Категория успешно обновлена");
  } catch (error: any) {
    console.error("Error updating category:", error);
    modalStore.showSuccess(
      `Ошибка при обновлении категории: ${
        error.message || "Неизвестная ошибка"
      }`
    );
  }
}

// Удаление категории
async function deleteCategory(id: string) {
  if (!id) return;

  // Сначала обновляем локальное состояние
  categories.value = categories.value.filter((cat) => cat.id !== id);
  modalStore.showSuccess("Категория успешно удалена");

  // Затем делаем API-запрос
  try {
    await fetch(`/api/categories/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Error deleting category:", error);
    // В случае ошибки не показываем сообщение пользователю, так как категория уже удалена из интерфейса
  }
}

// Удаление всех пустых категорий
async function deleteEmptyCategories() {
  try {
    isDeletingEmptyCategories.value = true;

    const response = await fetch("/api/categories/delete-empty", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.statusMessage || "Failed to delete empty categories"
      );
    }

    // Получаем обновленный список категорий
    const categoriesResponse = await fetch("/api/categories");
    if (categoriesResponse.ok) {
      const { categories: updatedCategories } = await categoriesResponse.json();
      categories.value = updatedCategories;
    }
  } catch (error: any) {
    console.error("Error deleting empty categories:", error);
    modalStore.showError(
      `Ошибка при удалении пустых категорий: ${
        error.message || "Неизвестная ошибка"
      }`
    );
  } finally {
    isDeletingEmptyCategories.value = false;
  }
}

// Закрытие модального окна редактирования
function closeEditCategoryModal() {
  showEditCategoryModal.value = false;
  editingCategory.value = null;
}

// Получение количества товаров в категории
function getCategoryProductCount(categoryId: string): number {
  const category = categories.value.find((c) => c.id === categoryId);

  const count = products.value.filter((product) => {
    const matches =
      category &&
      (product.category === category.name ||
        product.category_id === categoryId ||
        product.category_slug === category.slug);
    return matches;
  }).length;

  return count;
}

async function deleteAllRequests() {
  if (!confirm("Вы уверены, что хотите удалить все заявки?")) return;
  try {
    const res = await $fetch("/api/requests/delete-all", { method: "DELETE" });
    if (res && (res as any).success) {
      await fetchStats();
      modalStore.showSuccess("Все заявки удалены");
    }
  } catch (error) {
    console.error("Error deleting all requests:", error);
    modalStore.showError("Ошибка при удалении заявок");
  }
}

async function deleteRequest(id: number) {
  if (!confirm("Вы уверены, что хотите удалить эту заявку?")) return;
  try {
    const res = await $fetch(`/api/requests/${id}`, { method: "DELETE" });
    if (res && (res as any).deleted) {
      await fetchStats();
      modalStore.showSuccess("Заявка удалена");
    }
  } catch (error) {
    console.error("Error deleting request:", error);
    modalStore.showError("Ошибка при удалении заявки");
  }
}

// Обновляем функцию updateSpecsList
function updateSpecsList(
  productId: number | Record<number, any[]>,
  specs?: any[]
) {
  // Если первый аргумент - объект, значит это массовое обновление
  if (typeof productId === "object") {
    specsList.value = productId;

    // Обновляем specs в products
    Object.entries(productId).forEach(([id, specs]) => {
      const productIndex = products.value.findIndex((p) => p.id === Number(id));
      if (productIndex !== -1) {
        products.value[productIndex] = {
          ...products.value[productIndex],
          specs: specs,
        };
      }
    });
    return;
  }

  // Обычное обновление одного продукта
  specsList.value = {
    ...specsList.value,
    [productId]: specs?.map((spec, index) => ({
      ...spec,
      id: index + 1, // Пересчитываем ID для сохранения последовательности
    })),
  };

  // Обновляем продукт в основном списке
  const productIndex = products.value.findIndex((p) => p.id === productId);
  if (productIndex !== -1) {
    products.value[productIndex] = {
      ...products.value[productIndex],
      specs: specsList.value[productId],
    };
  }
}

// --- Массовое обновление show_in_filters по ключу ---
function setShowInFiltersForAll(key: string, value: boolean) {
  // Для всех товаров и их характеристик
  Object.keys(specsList.value).forEach((productId) => {
    const specs = specsList.value[Number(productId)];
    if (Array.isArray(specs)) {
      specs.forEach((spec) => {
        if (spec.key === key) {
          (spec as any).show_in_filters = value;
        }
      });
    }
  });
}

useHead({
  title: "Админка — КотлоЭнергоСнаб",
  meta: [
    {
      name: "description",
      content:
        "Панель администратора сайта КотлоЭнергоСнаб. Управление каталогом, заказами, статистикой.",
    },
    {
      name: "keywords",
      content:
        "КотлоЭнергоСнаб, админка, панель администратора, управление сайтом, Барнаул",
    },
    { name: "author", content: "КотлоЭнергоСнаб" },
    { property: "og:site_name", content: "КотлоЭнергоСнаб" },
    { property: "og:title", content: "Админка — КотлоЭнергоСнаб" },
    {
      property: "og:description",
      content:
        "Панель администратора сайта КотлоЭнергоСнаб. Управление каталогом, заказами, статистикой.",
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://kes-sib.ru/admin" },
    { property: "og:image", content: "/images/hero1.jpg" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Админка — КотлоЭнергоСнаб" },
    {
      name: "twitter:description",
      content:
        "Панель администратора сайта КотлоЭнергоСнаб. Управление каталогом, заказами, статистикой.",
    },
    { name: "robots", content: "noindex, nofollow" },
  ],
  link: [
    { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    { rel: "canonical", href: "https://kes-sib.ru/admin" },
  ],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "http://schema.org",
        "@type": "Organization",
        name: "КотлоЭнергоСнаб",
        url: "https://kes-sib.ru/",
        logo: "https://kes-sib.ru/favicon.ico",
      }),
    },
  ],
});

// Определяем типы для emit событий
interface Emits {
  "update:password": [value: string];
  login: [];
  logout: [];
  "add-product": [product: Product];
  "reset-form": [];
  toggle: [id: number];
  "update-with-specs": [product: Product];
  "cancel-edit": [id: number];
  "add-spec": [id: number, idx: number];
  "remove-spec": [idx: number];
  "add-new-spec": [];
  "remove-new-spec": [id: number];
  "delete-product": [id: number];
  "handle-image-upload": [event: Event, product: Product | Partial<Product>];
  "handle-connection-scheme-upload": [
    event: Event,
    product: Product | Partial<Product>
  ];
  "toggle-new-prod-fuel-dropdown": [];
  "add-category": [category: Category];
  "edit-category": [category: Category];
  "save-category": [id: string];
  "delete-category": [id: string];
  "delete-empty-categories": [];
  "close-edit-category-modal": [];
  "update:new-category": [value: Category];
  "update:editing-category": [value: Category];
  "update:show-add-category-modal": [value: boolean];
  "update:show-edit-category-modal": [value: boolean];
}

// Определяем emit с типами
const emit = defineEmits<Emits>();

// Добавляем состояние для отслеживания процесса бэкапа
const isBackupInProgress = ref(false);

// Функция для скачивания бэкапа
async function downloadBackup() {
  if (!process.client) return; // Проверяем, что мы на клиенте

  try {
    isBackupInProgress.value = true;

    // Делаем прямой запрос через fetch
    const response = await fetch("/api/admin/backup-db");

    if (!response.ok) {
      throw new Error("Ошибка при создании бэкапа");
    }

    // Получаем blob из ответа
    const blob = await response.blob();

    // Создаем URL для blob
    const url = window.URL.createObjectURL(blob);

    // Создаем ссылку для скачивания
    const link = document.createElement("a");
    link.href = url;

    // Получаем имя файла из заголовков или генерируем новое
    const contentDisposition = response.headers.get("content-disposition");
    const fileName = contentDisposition
      ? contentDisposition.split("filename=")[1].replace(/"/g, "")
      : `backup-${new Date().toISOString().split("T")[0]}.sql`;

    link.download = fileName;

    // Добавляем ссылку в документ, кликаем по ней и удаляем
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Освобождаем URL
    window.URL.revokeObjectURL(url);

    modalStore.showSuccess("Бэкап базы данных успешно создан");
  } catch (error) {
    console.error("Ошибка при создании бэкапа:", error);
    modalStore.showError("Ошибка при создании бэкапа базы данных");
  } finally {
    isBackupInProgress.value = false;
  }
}
</script>

<style lang="scss" scoped>
.log {
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.admin-section {
  padding: 1rem;
  z-index: 1000;

  @media (min-width: 768px) {
    padding: 2rem;
  }

  .login-box {
    max-width: 400px;
    margin: 2rem auto;
    padding: 1.5rem;
    background: var(--bg);
    border-radius: 0.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

  .catalog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;

    h1 {
      font-size: 1.5rem;
      margin-bottom: 0;
      text-align: left;

      @media (min-width: 768px) {
        font-size: 2rem;
      }
    }

    .logout-btn {
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      font-weight: 600;
      transition: all 0.2s ease;
      cursor: pointer;
      border: none;
      font-size: 0.95rem;
      min-width: 120px;
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
  }

  .add-form {
    background: var(--bg);
    padding: 1.5rem;
    border-radius: 0.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .category-select {
      margin-bottom: 1rem;

      .category-input {
        display: flex;
        gap: 1rem;
        align-items: center;

        select,
        input {
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

    input,
    textarea,
    select {
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
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .prod-summary {
      display: flex;
      align-items: center;
      padding: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
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

        input,
        textarea,
        select {
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
    content: "✔";
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--primary);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }

  &::after {
    content: "▼";
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
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
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
    content: "✔";
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }

  .category-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
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

.admin-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
  padding: 0 16px;
}

.backup-btn {
  background: linear-gradient(135deg, #28a745, #34ce57);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.2);

  &:hover {
    background: linear-gradient(135deg, #34ce57, #28a745);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
}
</style>
