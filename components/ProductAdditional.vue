<template>
  <div
    v-if="activeTab === 'additional'"
    class="section-block"
    v-scroll-reveal="'slide-in-right'"
  >
    <h2 class="section-title">Дополнительно потребуется</h2>
    <div
      v-if="
        additionalRequirements ||
        (requiredProducts && requiredProducts.length > 0)
      "
    >
      <div v-if="additionalRequirements" class="additional-description">
        {{ additionalRequirements }}
      </div>

      <div
        v-if="requiredProducts && requiredProducts.length > 0"
        class="required-products-grid"
      >
        <div
          v-for="prodId in requiredProducts"
          :key="prodId"
          class="required-product-card"
          @click="navigateToProduct(getProductById(prodId))"
        >
          <div class="required-product-card__image">
            <NuxtImg
              :src="normalizeImagePath(getProductById(prodId)?.image || '')"
              :alt="getProductById(prodId)?.name || 'Товар'"
              format="webp"
              quality="80"
              :width="200"
              :height="150"
              loading="lazy"
              sizes="200px"
            />
          </div>
          <div class="required-product-card__content">
            <h3 class="required-product-card__title">
              {{ getProductById(prodId)?.name || "Товар не найден" }}
            </h3>
            <p class="required-product-card__description">
              {{
                getProductById(prodId)?.description || "Описание отсутствует"
              }}
            </p>
            <div class="required-product-card__footer">
              <div class="required-product-card__price">
                <span class="price-value">
                  {{ getProductById(prodId)?.price?.toLocaleString() || "0" }}
                  ₽
                </span>
              </div>
              <div class="required-product-card__arrow">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      Для данного товара не указаны дополнительные требования
    </div>
  </div>
</template>

<script setup lang="ts">
interface ProductType {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category_slug: string;
  slug: string;
}

interface Props {
  activeTab: string;
  additionalRequirements?: string;
  requiredProducts?: number[];
  products: ProductType[];
  categorySlug: string;
}

const props = defineProps<Props>();
const router = useRouter();

// Add helper function to get product by ID
const getProductById = (id: number): ProductType | undefined => {
  return props.products.find((p) => p.id === id);
};

// Add helper function for navigation
const navigateToProduct = (product: ProductType | undefined) => {
  if (!product) return;

  // Проверяем, есть ли у товара category_slug, если нет - используем текущую категорию
  const targetCategorySlug = product.category_slug || props.categorySlug || "";

  router.push(`/catalog/${targetCategorySlug}/${generateProductSlug(product)}`);
  console.log("Navigating to product:", product);
};

const generateProductSlug = (product: ProductType): string => {
  if (!product || !product.name) return "";
  const name = product.name || "";
  return transliterate(name)
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

const transliterate = (text: string | undefined): string => {
  if (!text) return "";
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

// Добавляем функцию нормализации путей изображений
function normalizeImagePath(path: string | undefined): string {
  if (!path) return "/images/placeholders/placeholder.png";

  // Если путь уже начинается с /api/uploads/, оставляем как есть
  if (path.startsWith("/api/uploads/")) {
    return path;
  }

  // Если путь начинается с /uploads/, добавляем /api
  if (path.startsWith("/uploads/")) {
    return `/api${path}`;
  }

  // Если путь абсолютный (начинается с /), возвращаем как есть
  if (path.startsWith("/")) {
    return path;
  }

  // В остальных случаях предполагаем, что это относительный путь к uploads
  if (path.includes("uploads/")) {
    return `/api/${path}`;
  }

  return path;
}
</script>

<style scoped lang="scss">
.section-block {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  padding: 32px 24px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.4rem;
  margin-bottom: 18px;
  color: #ff6b6b;
  font-weight: 700;
  text-align: left;
}

.additional-description {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
  text-align: left;
}

.required-products-grid {
  display: grid;
  gap: 24px;
  margin-top: 24px;
}

.required-product-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: visible;
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
  padding-left: 200px;
  margin-left: 40px;
  margin-right: 40px;
  margin-top: 60px;

  &__image {
    position: absolute;
    left: 0px;
    top: -60px;
    width: 220px;
    height: 220px;
    display: flex;
    justify-content: center;
    align-items: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 8px;
      z-index: 2;
      transition: transform 0.3s ease;
    }
  }

  &__content {
    flex: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 10px;
  }

  &__description {
    font-size: 14px;
    color: #666;
    margin-bottom: 15px;
    flex: 1;
    white-space: pre-wrap;
    word-wrap: break-word;
    line-height: 1.5;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__price {
    font-size: 18px;
    font-weight: 600;
    color: #000;
    transition: opacity 0.3s ease;
  }

  &__arrow {
    opacity: 0;
    transform: translateX(-20px);
    transition: all 0.3s ease;

    svg {
      width: 24px;
      height: 24px;
      color: #e31e24;
    }
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 24px 24px rgba(0, 0, 0, 0.13);

    .required-product-card__arrow {
      opacity: 1;
      transform: translateX(0);
    }

    .required-product-card__image img {
      transform: scale(1.05);
    }
  }
}

.empty-state {
  text-align: center;
  font-size: 1.1rem;
  color: #999;
  padding: 40px 0;
}

@media (max-width: 768px) {
  .section-block {
    padding: 16px 12px;
  }

  .section-title {
    font-size: 1.2rem;
  }

  .required-products-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .required-product-card {
    padding-left: 0;
    margin-left: 0;
    margin-right: 0;
    margin-top: 0;

    &__image {
      position: relative;
      left: auto;
      top: auto;
      width: 100%;
      height: 160px;
      margin-bottom: 16px;
    }

    &__content {
      padding: 16px;
    }

    &__title {
      font-size: 1rem;
    }

    &__description {
      font-size: 0.85rem;
    }
  }
}

@media (max-width: 480px) {
  .required-products-grid {
    grid-template-columns: 1fr;
  }

  .required-product-card {
    &__image {
      height: 140px;
    }

    &__footer {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }
  }
}
</style>
