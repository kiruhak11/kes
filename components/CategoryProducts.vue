<template>
  <div class="products-section">
    <div class="products-header">
      <div class="products-count" v-if="products.length > 0">
        Найдено товаров: <strong>{{ totalProducts }}</strong>
      </div>
    </div>
    <div class="products-grid">
      <div
        v-for="(product, index) in products"
        :key="`${product.id}-${product.name}`"
        class="product-card"
        v-scroll-reveal="getReveal(index)"
      >
        <div
          class="product-card__clickable"
          @click="$emit('productClick', product)"
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
              <span class="product-title-icon"></span>
            </div>
            <div class="product-card__specs">
              <div
                v-for="spec in getSortedSpecs(product)"
                :key="spec.id"
                class="spec-item"
              >
                <span class="spec-label">{{
                  typeof spec === "object"
                    ? spec.key.slice(0, 30) +
                      (spec.key.length > 30 ? "..." : "")
                    : "Invalid spec"
                }}</span>
                <span class="spec-dots"></span>
                <span class="spec-value">{{
                  typeof spec === "object" ? spec.value : JSON.stringify(spec)
                }}</span>
              </div>
            </div>
            <div class="product-card__bottom">
              <div
                v-if="product.price && product.price !== 1"
                class="product-card__price-block"
              >
                <span class="product-price"
                  >{{ formatPrice(product.price) }}
                  <span class="currency">₽</span></span
                >
                <span class="product-price-note">Цена с НДС</span>
              </div>
              <div v-else class="product-card__price-block">
                <span class="product-price-placeholder">Цена по запросу</span>
              </div>
              <button
                class="buy-btn"
                @click.stop="$emit('addToCart', product, $event)"
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
          @click="$emit('openCommercialOfferModal', product)"
          v-scroll-reveal="'zoom-in'"
        >
          Заказать коммерческое предложение
        </button>
      </div>
      <div
        v-if="products.length === 0"
        class="no-products-message"
        v-scroll-reveal="'fade-in-up'"
      >
        Нет товаров в данной категории.
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { Product } from "~/types/product";
const props = defineProps<{
  products: Product[];
  totalProducts: number;
  getSortedSpecs: (product: Product) => any[];
  formatPrice: (price: number | null | undefined) => string;
}>();
function getReveal(index: number) {
  return index % 3 === 0
    ? "slide-in-left"
    : index % 3 === 1
    ? "fade-in-up"
    : "slide-in-right";
}
</script>
<style scoped lang="scss">
@import "~/assets/styles/global/category-products.scss";
</style>
