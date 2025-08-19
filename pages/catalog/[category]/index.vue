<template>
  <div class="category-page" :key="categorySlug">
    <div v-if="productsLoading || pending" class="loading-container">
      <UiLoader />
      <p>Загрузка товаров...</p>
    </div>

    <div v-else-if="productsError" class="error-container">
      <p>
        {{ productsError.message || "Произошла ошибка при загрузке товаров" }}
      </p>
      <button @click="handleRefresh" class="retry-button">
        Попробовать снова
      </button>
    </div>

    <div v-else class="container">
      <CategoryBreadcrumbs :title="categoryInfo?.title || 'Категория'" />
      <CategoryHeader
        :title="categoryInfo?.title || 'Категория'"
        :description="categoryInfo?.description || ''"
      />
      <CategoryFilters
        :filters-collapsed="filtersCollapsed"
        :filters-count="filteredSpecs.length + 1"
        :active-filters-count="activeFiltersCount"
        @toggleFiltersCollapsed="toggleFiltersCollapsed"
        @resetFilters="resetFilters"
        @resetAllFilters="resetAllFilters"
      >
        <!-- Фильтры по цене и характеристикам (оставляем как slot) -->
        <div class="filters-grid">
          <!-- Фильтр по цене -->
          <div class="filter-group">
            <div class="filter-group__header">
              <h4 class="filter-group__title">Цена</h4>
            </div>
            <div class="filter-group__content">
              <div class="price-range">
                <div class="price-inputs">
                  <div class="price-input-group">
                    <label>От</label>
                    <div class="input-wrapper">
                      <input
                        type="number"
                        v-model="priceRange.min"
                        placeholder="0"
                      />
                      <span class="currency-symbol">₽</span>
                    </div>
                  </div>
                  <div class="price-separator"></div>
                  <div class="price-input-group">
                    <label>До</label>
                    <div class="input-wrapper">
                      <input
                        type="number"
                        v-model="priceRange.max"
                        placeholder="∞"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Динамические фильтры -->
          <div v-for="spec in filteredSpecs" :key="spec" class="filter-group">
            <div class="filter-group__header">
              <h4 class="filter-group__title">{{ spec }}</h4>
            </div>
            <div class="filter-group__content">
              <template v-if="rangeFilters[spec]">
                <div class="price-range">
                  <div class="price-inputs">
                    <div class="price-input-group">
                      <label>От</label>
                      <div class="input-wrapper">
                        <input
                          type="number"
                          :value="getRangeFilterValue(spec, 'min')"
                          @input="updateRangeFilter(spec, 'min', $event)"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div class="price-separator"></div>
                    <div class="price-input-group">
                      <label>До</label>
                      <div class="input-wrapper">
                        <input
                          type="number"
                          :value="getRangeFilterValue(spec, 'max')"
                          @input="updateRangeFilter(spec, 'max', $event)"
                          placeholder="∞"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <template
                v-else-if="specOptions[spec] && specOptions[spec].length > 0"
              >
                <div class="filter-options">
                  <button
                    v-for="option in specOptions[spec]"
                    :key="option"
                    class="filter-option"
                    :class="{ active: dynamicFilters[spec] === option }"
                    @click="toggleFilterOption(spec, option)"
                  >
                    {{ option }}
                  </button>
                </div>
              </template>
            </div>
          </div>
        </div>
      </CategoryFilters>
      <CategoryProducts
        :products="paginatedProducts"
        :total-products="totalProducts"
        :get-sorted-specs="getSortedSpecs"
        :format-price="formatPrice"
        @productClick="
          (product) =>
            router.push(
              `/catalog/${categorySlug}/${generateProductSlug(product)}`
            )
        "
        @addToCart="addToCart"
        @openCommercialOfferModal="openCommercialOfferModal"
      />
      <CategoryPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :visible-pages="visiblePages"
        @goToPage="goToPage"
      />
    </div>
    <CommercialOfferModal
      v-if="showCommercialOfferModal && selectedProduct"
      :is-open="showCommercialOfferModal"
      :product="selectedProduct"
      @close="closeCommercialOfferModal"
    />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
  nextTick,
  onBeforeUnmount,
} from "vue";
import { useCartStore } from "~/stores/cart";
import { useRoute, useRouter } from "vue-router";
import CommercialOfferModal from "~/components/CommercialOfferModal.vue";
import type { Characteristic } from "~/types/product";
import { useNuxtApp } from "nuxt/app";
import { useImageOptimization } from "~/composables/useImageOptimization";
import CategoryBreadcrumbs from "~/components/CategoryBreadcrumbs.vue";
import CategoryHeader from "~/components/CategoryHeader.vue";
import CategoryFilters from "~/components/CategoryFilters.vue";
import CategoryProducts from "~/components/CategoryProducts.vue";
import CategoryPagination from "~/components/CategoryPagination.vue";

const { $vScrollReveal } = useNuxtApp();

// SEO Meta Tags будет добавлен после объявления переменных

const showCommercialOfferModal = ref(false);
const selectedProduct = ref<Product | null>(null);

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = "/images/placeholders/product-placeholder.png";
};

const openCommercialOfferModal = (product: Product) => {
  selectedProduct.value = product;
  showCommercialOfferModal.value = true;
};

const closeCommercialOfferModal = () => {
  showCommercialOfferModal.value = false;
  selectedProduct.value = null;
};
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
  const result = text
    .split("")
    .map((char) => mapping[char] || char)
    .join("");
  return result;
};

const generateProductSlug = (product: { name?: string | null }): string => {
  if (!product || !product.name) return "";
  return transliterate(product.name)
    .toLowerCase()
    .replace(/[\/\\]/g, "-")
    .replace(/[^a-z0-9\., -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/\.+/g, "-")
    .replace(/,+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(\d+)\.(\d+)/g, "$1-$2")
    .replace(/^-+|-+$/g, "");
};

interface Product {
  id: number;
  name: string | null;
  description: string | null;
  extendedDescription?: string | null;
  price: number | null;
  image: string | null;
  category_id: string | null;
  category_name?: string;
  category_slug?: string;
  category?: string;
  slug?: string;
  specs?: Characteristic[];
  additional_images?: string[] | null;
  images?: string[];
}

interface CategoryInfo {
  title: string;
  description: string;
  slug: string;
}

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();

// Состояния для пагинации
const currentPage = ref(1);
const itemsPerPage = 15;

// Products state
const allProducts = ref<Product[]>([]);
const pending = ref(false);

// Фильтры - простая инициализация без сохранения в URL
const priceRange = ref({
  min: undefined as number | undefined,
  max: undefined as number | undefined,
});

const dynamicFilters = ref<Record<string, any>>({});
const dynamicRangeFilters = ref<
  Record<string, { min: number | undefined; max: number | undefined }>
>({});

// Удаляю функцию fetchProducts и все связанные с ней watch
// Оставляю только useFetch для загрузки товаров
const categorySlug = computed(() => (route.params.category as string) || "");

const {
  data: productsData,
  pending: productsLoading,
  error: productsError,
  refresh: refreshProducts,
} = useFetch<{ products: Product[] }>(
  () => `/api/products/list?categorySlug=${categorySlug.value}`,
  {
    key: computed(() => `products-data-${categorySlug.value}`),
    watch: [categorySlug],
    server: false,
    initialCache: false,
    transform: (response) => {
      if (!response) return { products: [] };
      return response;
    },
  }
);

watchEffect(() => {
  if (productsData.value?.products) {
    allProducts.value = productsData.value.products;
  }
});

// Загружаем товары при инициализации, смене категории или фильтров
watch(
  [
    () => route.params.category,
    () => dynamicFilters.value,
    () => priceRange.value.min,
    () => priceRange.value.max,
  ],
  async () => {
    // Сбрасываем страницу при изменении фильтров или категории
    currentPage.value = 1;
  },
  { immediate: true, deep: true }
);

// Фильтры теперь сохраняются в URL через usePagination
// Страница будет сбрасываться автоматически при изменении фильтров

const categoryInfo = ref<CategoryInfo | undefined>(undefined);
const sliderImages = ref<string[]>([]);
const sliderIndex = ref(0);

// Обновляем слайдер при изменении продуктов
watch(
  () => allProducts.value,
  (newProducts) => {
    // Собираем картинки из товаров
    sliderImages.value = newProducts
      .filter((product) => product.image !== null)
      .map((product) => product.image as string);

    if (sliderImages.value.length === 0) {
      sliderImages.value = ["/images/placeholders/category-placeholder.png"];
    }
  },
  { immediate: true }
);

function prevSlide() {
  sliderIndex.value =
    (sliderIndex.value - 1 + sliderImages.value.length) %
    sliderImages.value.length;
}
function nextSlide() {
  sliderIndex.value = (sliderIndex.value + 1) % sliderImages.value.length;
}

// Отфильтрованные товары
const filteredProducts = computed<Product[]>(() => {
  let products = allProducts.value;

  // Фильтр по цене
  if (
    priceRange.value.min !== undefined ||
    priceRange.value.max !== undefined
  ) {
    products = products.filter((product) => {
      const price = product.price;
      if (!price) return false;

      if (priceRange.value.min !== undefined && price < priceRange.value.min) {
        return false;
      }
      if (priceRange.value.max !== undefined && price > priceRange.value.max) {
        return false;
      }
      return true;
    });
  }

  // Фильтры по характеристикам
  Object.entries(dynamicFilters.value).forEach(([key, value]) => {
    if (value && value !== "") {
      products = products.filter((product) => {
        if (!product.specs || !Array.isArray(product.specs)) return false;
        const spec = product.specs.find((s) => s.key === key);
        return spec && spec.value === value;
      });
    }
  });

  // Диапазонные фильтры
  Object.entries(dynamicRangeFilters.value).forEach(([key, range]) => {
    if (range.min !== undefined || range.max !== undefined) {
      products = products.filter((product) => {
        if (!product.specs || !Array.isArray(product.specs)) return false;
        const spec = product.specs.find((s) => s.key === key);
        if (!spec || !spec.value) return false;

        const value = parseFloat(spec.value);
        if (isNaN(value)) return false;

        if (range.min !== undefined && value < range.min) return false;
        if (range.max !== undefined && value > range.max) return false;
        return true;
      });
    }
  });

  return products;
});

// Общее количество страниц
const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / itemsPerPage);
});

// Товары для текущей страницы
const paginatedProducts = computed<Product[]>(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredProducts.value.slice(startIndex, endIndex);
});

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const goToPrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

// Вычисляем видимые страницы для пагинации
const visiblePages = computed(() => {
  const pages: number[] = [];
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= 7) {
    // Если страниц мало, показываем все
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Показываем первую, последнюю и 5 страниц вокруг текущей
    pages.push(1);

    let start = Math.max(2, current - 2);
    let end = Math.min(total - 1, current + 2);

    if (current <= 4) {
      end = Math.min(total - 1, 6);
    } else if (current >= total - 3) {
      start = Math.max(2, total - 5);
    }

    if (start > 2) {
      pages.push(-1); // Эллипсис
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < total - 1) {
      pages.push(-2); // Эллипсис
    }

    if (total > 1) {
      pages.push(total);
    }
  }

  return pages;
});

// Обновляем totalProducts на основе отфильтрованных товаров
const totalProducts = computed(() => filteredProducts.value.length);

const productsInCategory = computed<Product[]>(() => {
  return allProducts.value.filter((product) => {
    if (!product.category_name) return false;
    const productCategorySlug = transliterate(product.category_name)
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    return productCategorySlug === categorySlug.value;
  });
});

const powerUnits = computed(() => {
  const units = new Set<string>();
  productsInCategory.value.forEach((product) => {
    if (product.specs && Array.isArray(product.specs)) {
      const powerSpec = product.specs.find((spec) => spec.key === "power");
      if (powerSpec && powerSpec.value && powerSpec.value !== "отсутствует") {
        const match = powerSpec.value.match(/^(\d+(\.\d+)?)\s*(.*)$/);
        if (match) {
          units.add(match[3]);
        }
      }
    }
  });
  return Array.from(units);
});

const uniqueFuels = computed(() => {
  const fuels = new Set<string>();
  productsInCategory.value.forEach((product) => {
    if (product.specs && Array.isArray(product.specs)) {
      const fuelSpec = product.specs.find((spec) => spec.key === "fuel");
      if (fuelSpec && fuelSpec.value) {
        if (Array.isArray(fuelSpec.value)) {
          fuelSpec.value.forEach((f: string) => fuels.add(f));
        } else {
          fuels.add(fuelSpec.value);
        }
      }
    }
  });
  return Array.from(fuels);
});

// 1. Собираем все уникальные характеристики из specs, только с show_in_filters: true
const uniqueSpecs = computed<string[]>(() => {
  const specsSet = new Set<string>();
  productsInCategory.value.forEach((product) => {
    if (product.specs && Array.isArray(product.specs)) {
      product.specs.forEach((spec) => {
        if (spec.key && spec.show_in_filters) specsSet.add(spec.key);
      });
    }
  });
  return Array.from(specsSet);
});

// 2. Собираем возможные значения для каждой характеристики (только show_in_filters)
const specOptions = computed(() => {
  const options: Record<string, Set<any>> = {};
  productsInCategory.value.forEach((product) => {
    if (product.specs && Array.isArray(product.specs)) {
      product.specs.forEach((spec) => {
        if (spec.key && spec.value && spec.show_in_filters) {
          if (!options[spec.key]) options[spec.key] = new Set();
          options[spec.key].add(spec.value);
        }
      });
    }
  });
  // Преобразуем Set в массивы
  return Object.fromEntries(
    Object.entries(options).map(([k, v]) => [k, Array.from(v)])
  );
});

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

// Переключение страниц
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

function applyFilters() {
  // Filters are reactive, no need for explicit apply logic here beyond just triggering re-computation.
  // This function can be used for any additional side effects if needed in the future.
}

function resetFilters() {
  uniqueSpecs.value.forEach((spec) => {
    dynamicFilters.value[spec] = "";
    if (rangeFilters.value[spec])
      dynamicRangeFilters.value[spec] = { min: undefined, max: undefined };
  });
  priceRange.value = {
    min: undefined,
    max: undefined,
  };
}

function resetAllFilters() {
  uniqueSpecs.value.forEach((spec) => {
    dynamicFilters.value[spec] = "";
    if (rangeFilters.value[spec])
      dynamicRangeFilters.value[spec] = { min: undefined, max: undefined };
  });
  priceRange.value = {
    min: undefined,
    max: undefined,
  };
  currentPage.value = 1;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

const isMobile = ref(false);
onMounted(() => {
  isMobile.value = window.innerWidth <= 768;
  window.addEventListener("resize", () => {
    isMobile.value = window.innerWidth <= 768;
  });
});

const openFilters = ref<Record<string, boolean>>({});
const priceFilterOpen = ref(true); // Всегда открыт

function toggleSpecFilter(spec: string) {
  // Функция оставлена для совместимости, но не используется
}

function togglePriceFilter() {
  // Функция оставлена для совместимости, но не используется
}

function clearFilter(spec: string) {
  dynamicFilters.value[spec] = "";
  if (rangeFilters.value[spec] && dynamicRangeFilters.value[spec]) {
    dynamicRangeFilters.value[spec] = { min: undefined, max: undefined };
  }
}

function getRangeFilterValue(
  spec: string,
  field: "min" | "max"
): number | undefined {
  return dynamicRangeFilters.value[spec]?.[field];
}

function updateRangeFilter(spec: string, field: "min" | "max", event: Event) {
  const target = event.target as HTMLInputElement;
  const value = target.value === "" ? undefined : Number(target.value);

  if (!dynamicRangeFilters.value[spec]) {
    dynamicRangeFilters.value[spec] = { min: undefined, max: undefined };
  }

  dynamicRangeFilters.value[spec][field] = value;
}

function toggleFilterOption(spec: string, option: string) {
  if (dynamicFilters.value[spec] === option) {
    // Если уже выбран, снимаем выбор
    dynamicFilters.value[spec] = "";
  } else {
    // Выбираем новый вариант
    dynamicFilters.value[spec] = option;
  }
}

const generateCategorySlug = (category: string) => {
  const slug = transliterate(category)
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return slug;
};

const cartStore = useCartStore();

function addToCart(product: Product, e: Event) {
  e.stopPropagation();
  if (!product.name || !product.price || !product.image) {
    console.error("Invalid product data:", product);
    return;
  }
  // @ts-ignore
  cartStore.addItem({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    category: product.category_name || "Без категории",
    category_slug:
      product.category_slug ||
      generateCategorySlug(product.category_name || "Без категории"),
    slug: product.slug || generateProductSlug(product),
    quantity: 1,
  });
}

// Получаем инфу о категории
const { data: fetchedCategory, error: categoryError } = useFetch<{
  category: { name: string; description: string };
}>(() => `/api/categories/${categorySlug.value}`, {
  key: computed(() => `category-info-${categorySlug.value}`),
  watch: [categorySlug],
});

// Обновляем categoryInfo при изменении fetchedCategory
watchEffect(() => {
  if (fetchedCategory.value && fetchedCategory.value.category) {
    categoryInfo.value = {
      title: fetchedCategory.value.category.name || "",
      description: fetchedCategory.value.category.description || "",
      slug: categorySlug.value,
    };
  } else if (categoryError.value) {
    console.error("Failed to fetch category info:", categoryError.value);
  }
});

// Инициализируем все фильтры пустыми значениями и сбрасываем при загрузке страницы
onMounted(() => {
  // Сбрасываем все фильтры при загрузке страницы для избежания ошибок
  resetAllFilters();

  // Программно триггерим scroll событие
  window.dispatchEvent(new Event("scroll"));

  // Инициализируем фильтры
  uniqueSpecs.value.forEach((spec) => {
    dynamicFilters.value[spec] = "";
    // Инициализируем диапазонные фильтры
    if (rangeFilters.value[spec]) {
      dynamicRangeFilters.value[spec] = { min: undefined, max: undefined };
    }
  });

  // Очищаем URL от параметров фильтров
  const url = new URL(window.location.href);
  url.searchParams.delete("priceMin");
  url.searchParams.delete("priceMax");
  url.searchParams.delete("filters");
  url.searchParams.delete("rangeFilters");
  url.searchParams.delete("page");

  // Обновляем URL без перезагрузки страницы
  window.history.replaceState({}, "", url.toString());
});

// Следим за изменениями rangeFilters и инициализируем новые диапазонные фильтры
watch(
  rangeFilters,
  (newRangeFilters) => {
    Object.keys(newRangeFilters).forEach((spec) => {
      if (newRangeFilters[spec] && !dynamicRangeFilters.value[spec]) {
        dynamicRangeFilters.value[spec] = { min: undefined, max: undefined };
      }
    });
  },
  { immediate: true }
);

// 4. filteredSpecs - только характеристики с show_in_filters
const filteredSpecs = computed(() =>
  uniqueSpecs.value.filter(
    (spec) =>
      Array.isArray(specOptions.value[spec]) &&
      specOptions.value[spec].length > 1
  )
);

// SEO Meta Tags
useHead({
  title: computed(
    () => `${categoryInfo.value?.title || "Категория"} — КотлоЭнергоСнаб`
  ),
  meta: [
    {
      name: "description",
      content: computed(
        () =>
          `${
            categoryInfo.value?.title || "Категория"
          } котельного оборудования КотлоЭнергоСнаб. ${
            categoryInfo.value?.description ||
            "Производство и монтаж котельного оборудования в Барнауле."
          }`
      ),
    },
    {
      name: "keywords",
      content: computed(
        () =>
          `КотлоЭнергоСнаб, ${
            categoryInfo.value?.title || "категория"
          }, котельное оборудование, котлы, Барнаул, производство`
      ),
    },
    { name: "author", content: "КотлоЭнергоСнаб" },
    { property: "og:site_name", content: "КотлоЭнергоСнаб" },
    {
      property: "og:title",
      content: computed(
        () => `${categoryInfo.value?.title || "Категория"} — КотлоЭнергоСнаб`
      ),
    },
    {
      property: "og:description",
      content: computed(
        () =>
          `${
            categoryInfo.value?.title || "Категория"
          } котельного оборудования КотлоЭнергоСнаб. ${
            categoryInfo.value?.description ||
            "Производство и монтаж котельного оборудования в Барнауле."
          }`
      ),
    },
    { property: "og:type", content: "website" },
    {
      property: "og:url",
      content: computed(
        () =>
          `https://kes-sib.ru/catalog/${
            categoryInfo.value?.slug || route.params.category
          }`
      ),
    },
    {
      property: "og:image",
      content: computed(() => sliderImages.value[0] || "/images/hero1.jpg"),
    },
    { name: "twitter:card", content: "summary_large_image" },
    {
      name: "twitter:image",
      content: computed(() => sliderImages.value[0] || "/images/hero1.jpg"),
    },
    {
      name: "twitter:title",
      content: computed(
        () => `${categoryInfo.value?.title || "Категория"} — КотлоЭнергоСнаб`
      ),
    },
    {
      name: "twitter:description",
      content: computed(
        () =>
          `${
            categoryInfo.value?.title || "Категория"
          } котельного оборудования КотлоЭнергоСнаб. ${
            categoryInfo.value?.description ||
            "Производство и монтаж котельного оборудования в Барнауле."
          }`
      ),
    },
    { name: "robots", content: "index, follow" },
  ],
  link: [
    { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    {
      rel: "canonical",
      href: computed(
        () =>
          `https://kes-sib.ru/catalog/${
            categoryInfo.value?.slug || route.params.category
          }`
      ),
    },
  ],
  script: [
    {
      type: "application/ld+json",
      innerHTML: computed(() =>
        JSON.stringify({
          "@context": "http://schema.org",
          "@type": "Organization",
          name: "КотлоЭнергоСнаб",
          url: "https://kes-sib.ru/",
          logo: "https://kes-sib.ru/favicon.ico",
        })
      ),
    },
  ],
});

// Инициализируем все фильтры пустыми значениями и сбрасываем при загрузке страницы
onMounted(() => {
  // Сбрасываем все фильтры при загрузке страницы для избежания ошибок
  resetAllFilters();

  // Программно триггерим scroll событие
  window.dispatchEvent(new Event("scroll"));

  // Инициализируем фильтры
  uniqueSpecs.value.forEach((spec) => {
    dynamicFilters.value[spec] = "";
    // Инициализируем диапазонные фильтры
    if (rangeFilters.value[spec]) {
      dynamicRangeFilters.value[spec] = { min: undefined, max: undefined };
    }
  });

  // Очищаем URL от параметров фильтров
  const url = new URL(window.location.href);
  url.searchParams.delete("priceMin");
  url.searchParams.delete("priceMax");
  url.searchParams.delete("filters");
  url.searchParams.delete("rangeFilters");
  url.searchParams.delete("page");

  // Обновляем URL без перезагрузки страницы
  window.history.replaceState({}, "", url.toString());
});

// Следим за изменениями rangeFilters и инициализируем новые диапазонные фильтры
watch(
  rangeFilters,
  (newRangeFilters) => {
    Object.keys(newRangeFilters).forEach((spec) => {
      if (newRangeFilters[spec] && !dynamicRangeFilters.value[spec]) {
        dynamicRangeFilters.value[spec] = { min: undefined, max: undefined };
      }
    });
  },
  { immediate: true }
);

const filtersCollapsed = ref(true);
const toggleFiltersCollapsed = () => {
  filtersCollapsed.value = !filtersCollapsed.value;
};

// Подсчет активных фильтров
const activeFiltersCount = computed(() => {
  let count = 0;
  if (
    priceRange.value.min !== undefined ||
    priceRange.value.max !== undefined
  ) {
    count++;
  }
  Object.values(dynamicFilters.value).forEach((value) => {
    if (value && value !== "") {
      count++;
    }
  });
  return count;
});

// Красивый вывод номеров страниц (максимум 5 одновременно)

const formatPrice = (price: number | null | undefined) => {
  if (!price) return "0";
  return new Intl.NumberFormat("ru-RU", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// SEO Meta Tags для страницы категории
useHead({
  title: computed(
    () =>
      `${
        categoryInfo.value?.title || "Категория"
      } котельного оборудования | КотлоЭнергоСнаб — Производство в Барнауле`
  ),
  meta: [
    {
      name: "description",
      content: computed(
        () =>
          `${
            categoryInfo.value?.title || "Категория"
          } котельного оборудования КотлоЭнергоСнаб. ${
            categoryInfo.value?.description ||
            "Производство, монтаж, сервис котельного оборудования в Барнауле. Водогрейные котлы, паровые котлы, модульные котельные, теплообменники, дымососы, вентиляторы."
          }`
      ),
    },
    {
      name: "keywords",
      content: computed(
        () =>
          `${
            categoryInfo.value?.title || "категория"
          }, котельное оборудование, котлы, котельные, теплообменники, дымососы, вентиляторы, водогрейные котлы, паровые котлы, модульные котельные, КВр, КВа, КВз, МКУ, ТКУ, КМТ, производство, монтаж, Барнаул, Алтайский край, КотлоЭнергоСнаб`
      ),
    },
    {
      name: "author",
      content: "КотлоЭнергоСнаб",
    },
    {
      name: "robots",
      content:
        "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
    },
    {
      name: "googlebot",
      content:
        "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
    },
    {
      name: "yandex",
      content: "index, follow",
    },
    {
      property: "og:site_name",
      content: "КотлоЭнергоСнаб",
    },
    {
      property: "og:title",
      content: computed(
        () =>
          `${
            categoryInfo.value?.title || "Категория"
          } котельного оборудования | КотлоЭнергоСнаб — Производство в Барнауле`
      ),
    },
    {
      property: "og:description",
      content: computed(
        () =>
          `${
            categoryInfo.value?.title || "Категория"
          } котельного оборудования КотлоЭнергоСнаб. ${
            categoryInfo.value?.description ||
            "Производство, монтаж, сервис котельного оборудования в Барнауле."
          }`
      ),
    },
    {
      property: "og:type",
      content: "website",
    },
    {
      property: "og:url",
      content: computed(
        () =>
          `https://kes-sib.ru/catalog/${
            categoryInfo.value?.slug || route.params.category
          }`
      ),
    },
    {
      property: "og:image",
      content: computed(
        () => sliderImages.value[0] || "https://kes-sib.ru/images/hero1.jpg"
      ),
    },
    {
      property: "og:image:width",
      content: "1200",
    },
    {
      property: "og:image:height",
      content: "630",
    },
    {
      property: "og:locale",
      content: "ru_RU",
    },
    {
      name: "twitter:card",
      content: "summary_large_image",
    },
    {
      name: "twitter:image",
      content: computed(
        () => sliderImages.value[0] || "https://kes-sib.ru/images/hero1.jpg"
      ),
    },
    {
      name: "twitter:title",
      content: computed(
        () =>
          `${
            categoryInfo.value?.title || "Категория"
          } котельного оборудования | КотлоЭнергоСнаб — Производство в Барнауле`
      ),
    },
    {
      name: "twitter:description",
      content: computed(
        () =>
          `${
            categoryInfo.value?.title || "Категория"
          } котельного оборудования КотлоЭнергоСнаб. ${
            categoryInfo.value?.description ||
            "Производство, монтаж, сервис котельного оборудования в Барнауле."
          }`
      ),
    },
    {
      name: "canonical",
      content: computed(
        () =>
          `https://kes-sib.ru/catalog/${
            categoryInfo.value?.slug || route.params.category
          }`
      ),
    },
  ],
  link: [
    {
      rel: "icon",
      href: "/favicon.ico",
      type: "image/x-icon",
    },
    {
      rel: "canonical",
      href: computed(
        () =>
          `https://kes-sib.ru/catalog/${
            categoryInfo.value?.slug || route.params.category
          }`
      ),
    },
  ],
  script: [
    {
      type: "application/ld+json",
      innerHTML: computed(() =>
        JSON.stringify({
          "@context": "http://schema.org",
          "@type": "CollectionPage",
          name:
            categoryInfo.value?.title || "Категория котельного оборудования",
          description:
            categoryInfo.value?.description ||
            "Категория котельного оборудования КотлоЭнергоСнаб",
          url: `https://kes-sib.ru/catalog/${
            categoryInfo.value?.slug || route.params.category
          }`,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: totalProducts.value,
            itemListElement: paginatedProducts.value.map((product, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Product",
                name: product.name,
                description: product.description,
                image: product.image,
                category: categoryInfo.value?.title,
                brand: {
                  "@type": "Brand",
                  name: "КотлоЭнергоСнаб",
                },
              },
            })),
          },
          publisher: {
            "@type": "Organization",
            name: "КотлоЭнергоСнаб",
            url: "https://kes-sib.ru/",
            logo: "https://kes-sib.ru/favicon.ico",
          },
        })
      ),
    },
  ],
});

// Функция для сортировки характеристик
const getSortedSpecs = (product: Product) => {
  if (!product.specs || !Array.isArray(product.specs)) return [];
  return [...product.specs]
    .sort((a, b) => (a.id || 0) - (b.id || 0))
    .slice(0, 4);
};

const handleRefresh = async () => {
  pending.value = true;
  try {
    await refreshProducts();
    await fetchProducts();
  } finally {
    pending.value = false;
  }
};

watch(
  () => route.params.category,
  async () => {
    resetAllFilters();
    await nextTick();
    if (typeof refreshProducts === "function") {
      await refreshProducts();
    }
    console.log(
      "categorySlug:",
      categorySlug.value,
      "allProducts:",
      allProducts.value
    );
  }
);
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
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);
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
  flex-direction: row;
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
  transition: transform 0.3s cubic-bezier(0.4, 2, 0.6, 1);
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
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 32px 32px;
}

.filter-group {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.filter-group__header {
  padding: 16px 0 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.filter-group__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #e31e24;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-group__content {
  padding: 16px 0;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-option {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  color: #495057;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  user-select: none;
}

.filter-option:hover {
  background: #e9ecef;
  border-color: #dee2e6;
  transform: translateY(-1px);
}

.filter-option.active {
  background: #e31e24;
  border-color: #e31e24;
  color: #fff;
  box-shadow: 0 2px 8px rgba(227, 30, 36, 0.25);
}

.filter-option.active:hover {
  background: #c41e24;
  border-color: #c41e24;
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
.filters-slide-enter-active,
.filters-slide-leave-active {
  transition: max-height 0.45s cubic-bezier(0.4, 2, 0.6, 1), opacity 0.35s,
    padding 0.3s;
}
.filters-slide-enter-from,
.filters-slide-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.filters-slide-enter-to,
.filters-slide-leave-from {
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
  box-shadow: 0 24px 24px rgba(0, 0, 0, 0.13);
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
  gap: 0.5rem;
}
.spec-label {
  color: #222;
  font-weight: 600;
}

.spec-dots {
  flex-grow: 1;
  border-bottom: 2px dotted #e0e0e0;
  position: relative;
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
  white-space: nowrap;
}
.product-price-placeholder {
  font-size: 1.2rem;
  font-weight: 700;
  color: #e31e24;
  line-height: 1;
  white-space: nowrap;
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
  content: "";
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
}

@media (max-width: 992px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
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
    gap: 12px;
  }

  .filters-header__right {
    width: 100%;
    right: auto;
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
    gap: 16px;
    padding: 16px 20px 24px;
  }

  .filter-group__header {
    padding: 12px 0 6px 0;
  }

  .filter-group__title {
    font-size: 1rem;
  }

  .filter-group__content {
    padding: 12px 0;
  }

  .filter-options {
    gap: 6px;
  }

  .filter-option {
    padding: 6px 12px;
    font-size: 0.85rem;
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

  .input-wrapper input {
    padding: 10px 12px;
    font-size: 0.9rem;
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
  .product-title {
    font-size: 1.05rem;
    margin-bottom: 7px;
    text-align: center;
  }
  .product-card__specs {
    margin-bottom: 10px;
    font-size: 1rem;
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
  box-shadow: 0 2px 8px rgba(227, 30, 36, 0.07);
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
  box-shadow: 0 4px 12px rgba(227, 30, 36, 0.15);
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

.pagination-ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  color: #666;
  font-weight: 600;
}

.category-slider {
  text-align: center;
  margin-bottom: 30px;
}
.slider-wrapper {
  position: relative;
  display: inline-block;
}
.slider-image {
  max-width: 400px;
  max-height: 250px;
  border-radius: 10px;
}
.slider-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: #fff;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  padding: 0 10px;
}
.slider-btn.prev {
  left: -40px;
}
.slider-btn.next {
  right: -40px;
}
.slider-placeholder {
  color: #aaa;
  font-size: 1.2rem;
  padding: 40px 0;
}

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

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  text-align: center;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.07);
  margin: 20px auto;
  max-width: 1200px;
}

.loading-container p {
  margin-top: 1rem;
  color: #666;
  font-size: 1.1rem;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  text-align: center;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.07);
  margin: 20px auto;
  max-width: 1200px;
}

.error-container p {
  color: #dc3545;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.retry-button {
  background: #e31e24;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background: #c31a1f;
  transform: translateY(-1px);
}
</style>
