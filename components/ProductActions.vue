<template>
  <div class="product-main-actions">
    <div class="cart-action-wrap">
      <div class="product-card__price-block">
        <span v-if="product.price != 1" class="product-price">{{
          formatPrice(product.price) + " ₽"
        }}</span>
        <span v-else class="product-price">Цена по запросу</span>
        <span class="product-price-note">Цена с НДС</span>
      </div>
      <button
        v-if="!cartCount"
        class="buy-btn"
        @click="addToCart"
        v-scroll-reveal="'zoom-in'"
      >
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
          <path d="M6 6h15l-1.5 9h-13z" stroke="#e31e24" stroke-width="2" />
          <circle cx="9" cy="20" r="1" fill="#e31e24" />
          <circle cx="18" cy="20" r="1" fill="#e31e24" />
        </svg>
        <span>Положить в корзину</span>
      </button>
      <div v-else class="cart-counter">
        <button class="cart-minus" @click="decrementCart">-</button>
        <span class="cart-qty">{{ cartCount }}</span>
        <button class="cart-plus" @click="incrementCart">+</button>
      </div>
    </div>
    <div class="product-main-actions-right">
      <button
        class="offer-btn"
        @click="openCommercialOfferModal(product)"
        v-scroll-reveal="'zoom-in'"
      >
        Заказать коммерческое предложение
      </button>
      <a
        v-if="$device.isMobile"
        :href="`tel:${contacts.phone[0]}`"
        class="offer-btn"
        >Уточнить наличие</a
      >
      <button
        v-else
        class="offer-btn"
        @click="openOfferModal()"
        v-scroll-reveal="'zoom-in'"
      >
        Уточнить наличие
      </button>
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
import { useCartStore } from "~/stores/cart";
import { contacts } from "~/data/contacts";
import { useModalStore } from "~/stores/modal";
import { useRouter } from "vue-router";

interface ProductType {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  category_slug: string;
  slug: string;
}

interface Props {
  product: ProductType;
  categorySlug: string;
}

const props = defineProps<Props>();
const cartStore = useCartStore();
const modalStore = useModalStore();
const router = useRouter();

const cartItem = computed(() =>
  cartStore.items.find((item: any) => item.id === props.product?.id)
);
const formatPrice = (price: number | null | undefined) => {
  if (!price) return "0";
  return new Intl.NumberFormat("ru-RU", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};
const cartCount = computed(() =>
  cartItem.value ? cartItem.value.quantity : 0
);

const addToCart = () => {
  if (!props.product) return;

  const cartItem = {
    id: props.product.id,
    name: props.product.name,
    price: props.product.price,
    image: props.product.image,
    quantity: 1,
    category: props.product.category || "Без категории",
    category_slug:
      props.product.category_slug || props.categorySlug || "unknown",
    slug: props.product.slug || generateProductSlug(props.product),
  };

  cartStore.addItem(JSON.parse(JSON.stringify(cartItem)));
};

const incrementCart = () => {
  if (props.product) {
    const cartItem = {
      id: props.product.id,
      name: props.product.name,
      price: props.product.price,
      image: props.product.image,
      quantity: 1,
      category: props.product.category || "Без категории",
      category_slug:
        props.product.category_slug || props.categorySlug || "unknown",
      slug: props.product.slug || generateProductSlug(props.product),
    };
    cartStore.addItem(JSON.parse(JSON.stringify(cartItem)));
  }
};

const decrementCart = () => {
  if (props.product && cartItem.value && cartItem.value.quantity > 0) {
    if (cartItem.value.quantity === 1) {
      cartStore.removeItem(props.product.id);
    } else {
      cartStore.updateQuantity(props.product.id, cartItem.value.quantity - 1);
    }
  }
};

const openOfferModal = () => {
  modalStore.openModal(
    "Уточнить наличие",
    `Пожалуйста, уточните наличие товара у нашего менеджера. \n\n${contacts.phone[0]}`,
    "Я позвоню",
    () => {
      window.location.href = `tel:${contacts.phone[0]}`;
    }
  );
};

const showCommercialOfferModal = ref(false);

const selectedProduct = ref<Product | null>(null);
const openCommercialOfferModal = (product: Product) => {
  selectedProduct.value = product;
  showCommercialOfferModal.value = true;
};

const closeCommercialOfferModal = () => {
  showCommercialOfferModal.value = false;
  selectedProduct.value = null;
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
    ъ: "-",
    ы: "y",
    ь: "-",
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
    Ъ: "-",
    Ы: "Y",
    Ь: "-",
    Э: "E",
    Ю: "Yu",
    Я: "Ya",
  };
  return text
    .split("")
    .map((char) => mapping[char] || char)
    .join("");
};
</script>

<style scoped lang="scss">
.product-main-actions {
  display: flex;
  align-items: stretch;
  gap: 18px;
  margin-top: 24px;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: space-between;
}

.product-card__price-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 12px;

  padding: 12px 12px;
  flex: 1 1 50%;
  min-width: 0;
  background: #f7f7f7;
  box-shadow: 0 2px 12px rgba(227, 30, 36, 0.04);
  margin: 0;
  justify-content: center;
}

.product-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e31e24;
  line-height: 1;
}

.product-price-note {
  font-size: 0.9rem;
  color: #888;
  margin-top: 2px;
}

.buy-btn {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  margin: 0;
  justify-content: center;
  box-sizing: border-box;
  border-radius: 12px;
  border: 1.5px solid #e31e24;
  background: #fff;
  color: #e31e24;
  font-size: 1.18rem;
  font-weight: 600;
  height: 54px;
  box-shadow: 0 2px 16px rgba(227, 30, 36, 0.07);
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.25s, border-color 0.2s, background 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  gap: 12px;
}

.buy-btn svg {
  margin-right: 8px;
  width: 28px;
  height: 28px;
}

.buy-btn:hover {
  background: #fff6f6;
  color: #e31e24;
  border-color: #e31e24;
  box-shadow: 0 4px 24px rgba(227, 30, 36, 0.13);
}

.buy-btn::after {
  content: "";
  display: block;
  position: absolute;
  left: -60%;
  top: 0;
  width: 60%;
  height: 100%;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0.18) 0%,
    rgba(255, 255, 255, 0.38) 50%,
    rgba(255, 255, 255, 0.12) 100%
  );
  transform: skewX(-25deg);
  transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.buy-btn:hover::after {
  left: 110%;
}

.cart-action-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50%;
  min-width: 0;
  gap: 12px;
  flex: 1 1 50%;
  margin-bottom: 0;
  box-sizing: border-box;
}

.offer-btn {
  background: linear-gradient(45deg, #e31e24, #ff4d4d);
  color: #fff;
  border: none;
  padding: 6px 22px;
  font-size: 1rem;
  text-align: center;
  font-weight: 700;
  cursor: pointer;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(227, 30, 36, 0.1);
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
}

.offer-btn:hover {
  background: linear-gradient(45deg, #ff4d4d, #e31e24);
}

.cart-counter {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  justify-content: center;
  box-sizing: border-box;
  border-radius: 12px;
  border: 1.5px solid #e31e24;
  background: #fff;
  height: 54px;
  display: flex;
  align-items: center;
  gap: 0;
  box-shadow: 0 2px 16px rgba(227, 30, 36, 0.07);
  overflow: hidden;
  position: relative;
  transition: box-shadow 0.25s, border-color 0.2s, background 0.2s, color 0.2s;
}

.cart-minus,
.cart-plus {
  background: transparent;
  border: none;
  color: #e31e24;
  font-size: 2rem;
  font-weight: 700;
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  border-radius: 0;
}

.cart-minus:hover,
.cart-plus:hover {
  background: #fff6f6;
  color: #b71c1c;
}

.cart-qty {
  flex: 1 1 auto;
  text-align: center;
  font-size: 1.4rem;
  font-weight: 700;
  color: #e31e24;
  letter-spacing: 0.04em;
}

.product-main-actions-right {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .product-main-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 18px;
  }

  .cart-action-wrap,
  .product-card__price-block {
    width: 100%;
    min-width: 0;
    flex: 1 1 100%;
  }

  .buy-btn,
  .cart-counter {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    font-size: 0.9rem;
  }
}
</style>
