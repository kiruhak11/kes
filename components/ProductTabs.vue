<template>
  <div class="product-tabs" v-scroll-reveal="'fade-in-up'">
    <button
      v-for="tab in productTabs"
      :key="tab.key"
      :class="['tab-btn', { active: activeTab === tab.key }]"
      @click="activeTab = tab.key"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface Tab {
  key: string;
  label: string;
}

interface Props {
  activeTab: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:activeTab": [value: string];
}>();

const activeTab = computed({
  get: () => props.activeTab,
  set: (value) => emit("update:activeTab", value),
});

const productTabs = [
  { key: "description", label: "Описание товара" },
  { key: "specs", label: "Технические характеристики" },
  { key: "delivery", label: "Комплект поставки" },
  { key: "additional", label: "Дополнительно потребуется" },
  { key: "certificates", label: "Сертификаты и гарантии" },
];
</script>

<style scoped lang="scss">
.product-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  border-bottom: 2px solid #eee;
  background: #fafbfc;
  padding: 0 0 0.5rem 0;
}

.tab-btn {
  background: none;
  border: none;
  outline: none;
  font-size: 1.08rem;
  font-weight: 500;
  color: #888;
  padding: 10px 22px 10px 22px;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  position: relative;
}

.tab-btn.active {
  background: #fff;
  color: #ff6b6b;
  border-bottom: 2px solid #ff6b6b;
  font-weight: 700;
  z-index: 2;
}

.tab-btn:not(.active):hover {
  background: #f7f7fa;
  color: #222;
}

@media (max-width: 768px) {
  .product-tabs {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #fafbfc;
    padding: 8px 0;
    margin: 0 -4px;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    border-bottom: 2px solid #eee;
  }

  .product-tabs::-webkit-scrollbar {
    display: none;
  }

  .tab-btn {
    flex-shrink: 0;
    white-space: nowrap;
    font-size: 0.95rem;
    padding: 10px 16px;
  }
}
</style>
