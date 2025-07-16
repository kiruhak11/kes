<template>
  <div class="category-page">
    <div class="container">
      <nav class="breadcrumbs" v-scroll-reveal="'fade-in'">
        <NuxtLink to="/">Главная</NuxtLink>
        <span class="breadcrumbs-separator">→</span>
        <NuxtLink to="/catalog">Каталог</NuxtLink>
        <span class="breadcrumbs-separator">→</span>
        <span>{{ categoryInfo?.title || "Категория" }}</span>
      </nav>
      <div class="category-header" v-scroll-reveal="'fade-in-up'">
        <h1 class="page-title">{{ categoryInfo?.title || "Категория" }}</h1>
        <p class="category-description">
          {{ categoryInfo?.description || "" }}
        </p>
      </div>

      <!-- Фильтры сверху -->
      <div class="filters-section" v-scroll-reveal="'fade-in-up'">
        <div
          class="filters-header"
          @click="toggleFiltersCollapsed"
          style="cursor: pointer; user-select: none"
        >
          <div class="filters-header__left">
            <svg
              class="filters-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M3 4h18M7 8h10M9 12h6M11 16h2"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            <h3 class="filters-header__title">Фильтры</h3>
            <span class="filters-count" v-if="!filtersCollapsed"
              >({{ filteredSpecs.length + 1 }})</span
            >
          </div>
          <div class="filters-header__right">
            <div class="active-filters-badge" v-if="activeFiltersCount > 0">
              {{ activeFiltersCount }}
            </div>
            <span
              class="filters-header__arrow"
              :style="{
                transform: filtersCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
              }"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>

        <transition name="filters-slide">
          <div v-show="!filtersCollapsed" class="filters-container">
            <div class="filters-toolbar">
              <div class="filters-info">
                <span class="filters-subtitle">Настройте параметры поиска</span>
              </div>
              <div class="filters-actions">
                <button
                  class="clear-all-btn"
                  @click.stop="resetFilters"
                  v-if="activeFiltersCount > 0"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 6L6 18M6 6L18 18"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                  Очистить все
                </button>
                <button class="reset-all-btn" @click.stop="resetAllFilters">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0z"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                    <path
                      d="M12 6v6l4 2"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                  </svg>
                  Сбросить все
                </button>
              </div>
            </div>

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
              <div
                v-for="spec in filteredSpecs"
                :key="spec"
                class="filter-group"
              >
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
                  <template v-else-if="specOptions[spec] && specOptions[spec].length > 0">
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
          </div>
        </transition>
      </div>

      <!-- Товары -->
      <div class="products-section">
        <div class="products-header">
          <div class="products-count" v-if="filteredProducts.length > 0">
            Найдено товаров: <strong>{{ totalProducts }}</strong>
          </div>
        </div>

        <div class="products-grid">
          <div
            v-for="(product, index) in paginatedProducts"
            :key="product.id"
            class="product-card"
            v-scroll-reveal="
              index % 3 === 0
                ? 'slide-in-left'
                : index % 3 === 1
                ? 'fade-in-up'
                : 'slide-in-right'
            "
          >
            <div
              class="product-card__clickable"
              @click="
                router.push(
                  `/catalog/${product.category_slug}/${generateProductSlug(
                    product
                  )}`
                )
              "
            >
              <div class="product-card__img-wrap">
                <img
                  :src="product.image ?? undefined"
                  :alt="product.name ?? undefined"
                  class="product-image"
                />
              </div>
              <div class="product-card__content">
                <div class="product-card__title-row">
                  <h3 class="product-title">{{ product.name }}</h3>
                  <span class="product-title-icon"
                    ><!-- иконка, если нужна --></span
                  >
                </div>
                <div class="product-card__specs">
                  <div
                    v-for="spec in (product.specs || []).slice(0, 4)"
                    :key="spec.id"
                    class="spec-item"
                  >
                    <span class="spec-label">{{
                      typeof spec === "object" ? spec.key : "Invalid spec"
                    }}</span>
                    <span class="spec-dots"></span>
                    <span class="spec-value">{{
                      typeof spec === "object"
                        ? spec.value
                        : JSON.stringify(spec)
                    }}</span>
                  </div>
                </div>
                <div class="product-card__bottom">
                  <div class="product-card__price-block">
                    <span class="product-price"
                      >{{ formatPrice(product.price) }}
                      <span class="currency">₽</span></span
                    >
                    <span class="product-price-note">Цена с НДС</span>
                  </div>
                  <button
                    class="buy-btn"
                    @click.stop="addToCart(product, $event)"
                    v-scroll-reveal="'zoom-in'"
                  >
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                      <path
                        d="M6 6h15l-1.5 9h-13z"
                        stroke="#e31e24"
                        stroke-width="2"
                      />
                      <circle cx="9" cy="20" r="1" fill="#e31e24" />
                      <circle cx="18" cy="20" r="1" fill="#e31e24" />
                    </svg>
                    <span>Купить</span>
                  </button>
                </div>
              </div>
            </div>
            <button
              class="offer-btn"
              @click="openCommercialOfferModal(product)"
              v-scroll-reveal="'zoom-in'"
            >
              Заказать коммерческое предложение
            </button>
          </div>
          <div
            v-if="filteredProducts.length === 0"
            class="no-products-message"
            v-scroll-reveal="'fade-in-up'"
          >
            Нет товаров в данной категории.
          </div>
        </div>
      </div>
    </div>
    <div
      class="pagination"
      v-if="totalPages > 1"
      v-scroll-reveal="'fade-in-up'"
    >
      <button
        class="pagination-btn pagination-btn--arrow"
        :disabled="currentPage === 1"
        @click="goToPage(1)"
        aria-label="Первая страница"
      >
        «
      </button>
      <button
        class="pagination-btn pagination-btn--arrow"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
        aria-label="Назад"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            d="M15 18l-6-6 6-6"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
          />
        </svg>
      </button>
      <span v-for="page in visiblePages" :key="page">
        <button
          v-if="page > 0"
          class="pagination-btn"
          :class="{ active: page === currentPage }"
          @click="goToPage(page)"
          :disabled="page === currentPage"
        >
          {{ page }}
        </button>
        <span v-else class="pagination-ellipsis">...</span>
      </span>
      <button
        class="pagination-btn pagination-btn--arrow"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
        aria-label="Вперед"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            d="M9 6l6 6-6 6"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
          />
        </svg>
      </button>
      <button
        class="pagination-btn pagination-btn--arrow"
        :disabled="currentPage === totalPages"
        @click="goToPage(totalPages)"
        aria-label="Последняя страница"
      >
        »
      </button>
    </div>
  </div>
  <CommercialOfferModal
    v-if="showCommercialOfferModal && selectedProduct"
    :is-open="showCommercialOfferModal"
    :product="selectedProduct"
    @close="closeCommercialOfferModal"
  />
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

  console.log("transliterate debug:", { input: text, output: result });

  return result;
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

// Pagination state
const currentPage = ref(1);
const itemsPerPage = 15; // Было 21, теперь 15

// Products state
const allProducts = ref<Product[]>([]);

// Фильтры - простая инициализация без сохранения в URL
const priceRange = ref({
  min: undefined as number | undefined,
  max: undefined as number | undefined,
});

const dynamicFilters = ref<Record<string, any>>({});
const dynamicRangeFilters = ref<
  Record<string, { min: number | undefined; max: number | undefined }>
>({});

// Fetch products (загружаем все товары сразу)
const fetchProducts = async () => {
  const { data: fetched, error } = await useFetch("/api/products", {
    query: {
      categorySlug: route.params.category,
    },
    transform: (response) => {
      if (!response || !response.products) {
        console.error("Invalid response format:", response);
        return {
          products: [],
          pagination: { total: 0, page: 1, limit: 15, totalPages: 0 },
        };
      }
      return response;
    },
  });
  if (error.value) {
    console.error("Error fetching products:", error.value);
    allProducts.value = [];
  } else if (fetched.value) {
    allProducts.value = fetched.value.products as unknown as Product[];
  } else {
    allProducts.value = [];
  }
};

// Загружаем товары только при инициализации и при смене категории
watch(
  [() => route.params.category],
  () => {
    fetchProducts();
  },
  { immediate: true, deep: true }
);

// Фильтры теперь сохраняются в URL через usePagination
// Страница будет сбрасываться автоматически при изменении фильтров

const categorySlug = ref(route.params.category as string);

watch(
  () => route.params.category,
  (newCategorySlug) => {
    categorySlug.value = newCategorySlug as string;
    // No need to reload all products, just re-filter
  }
);

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

// Отфильтрованные товары с пагинацией
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

// Товары для текущей страницы
const paginatedProducts = computed<Product[]>(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredProducts.value.slice(startIndex, endIndex);
});

// Вычисляем общее количество страниц
const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / itemsPerPage);
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
    };
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

const generateProductSlug = (product: Product) => {
  if (!product || !product.name) return "";
  return transliterate(product.name)
    .toLowerCase()
    .replace(/[.,]/g, "-") // Сначала точки и запятые на дефис
    .replace(/[^a-z0-9 -]/g, "") // Потом убрать всё лишнее
    .replace(/[\s-]+/g, "-") // Группы пробелов и дефисов в один дефис
    .replace(/^-+|-+$/g, ""); // Убрать дефисы по краям
};

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
const { data: fetchedCategory, error: categoryError } = await useFetch<{
  category: { name: string; description: string };
}>(`/api/categories/${categorySlug.value}`);

if (fetchedCategory.value && fetchedCategory.value.category) {
  categoryInfo.value = {
    title: fetchedCategory.value.category.name || "",
    description: fetchedCategory.value.category.description || "",
    slug: categorySlug.value,
  };
} else {
  console.error("Failed to fetch category info:", categoryError.value);
}

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
  url.searchParams.delete('priceMin');
  url.searchParams.delete('priceMax');
  url.searchParams.delete('filters');
  url.searchParams.delete('rangeFilters');
  url.searchParams.delete('page');
  
  // Обновляем URL без перезагрузки страницы
  window.history.replaceState({}, '', url.toString());
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
    { property: "og:image", content: "/images/hero1.jpg" },
    { name: "twitter:card", content: "summary_large_image" },
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
  url.searchParams.delete('priceMin');
  url.searchParams.delete('priceMax');
  url.searchParams.delete('filters');
  url.searchParams.delete('rangeFilters');
  url.searchParams.delete('page');
  
  // Обновляем URL без перезагрузки страницы
  window.history.replaceState({}, '', url.toString());
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
    { property: "og:image", content: "/images/hero1.jpg" },
    { name: "twitter:card", content: "summary_large_image" },
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
  url.searchParams.delete('priceMin');
  url.searchParams.delete('priceMax');
  url.searchParams.delete('filters');
  url.searchParams.delete('rangeFilters');
  url.searchParams.delete('page');
  
  // Обновляем URL без перезагрузки страницы
  window.history.replaceState({}, '', url.toString());
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
    { property: "og:image", content: "/images/hero1.jpg" },
    { name: "twitter:card", content: "summary_large_image" },
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
  flex: 1;
  border-bottom: 1px dotted #bbb;
  margin: 0 8px;
  height: 1px;
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
</style>
