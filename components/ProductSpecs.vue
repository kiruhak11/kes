<template>
  <div
    v-if="activeTab === 'specs'"
    class="section-block"
    v-scroll-reveal="'slide-in-right'"
  >
    <h2 class="section-title">Технические характеристики</h2>
    <ul class="specs-list">
      <li
        v-if="displaySpecs.length > 0"
        v-for="spec in displaySpecs"
        :key="spec.id"
        class="spec-item"
      >
        <span class="spec-label">{{
          isMobile
            ? capitalize(spec.key).slice(0, 24) +
              (spec.key.length > 24 ? "..." : "")
            : capitalize(spec.key).slice(0, 64) +
              (spec.key.length > 64 ? "..." : "")
        }}</span>
        <span class="spec-dots"></span>
        <span class="spec-value">{{ spec.value }}</span>
      </li>
      <li v-else class="spec-empty">
        <div class="spec-empty-content">
          <UiEmpty />
          <p>Технические характеристики уточняются.</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { Characteristic } from "~/types/product";

interface Props {
  activeTab: string;
  displaySpecs: Characteristic[];
  isMobile: boolean;
}

defineProps<Props>();

const capitalize = (s: string) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};
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

.specs-list {
  list-style: none;
  padding: 0;
  max-width: 800px;
  margin: 0 auto;
}

.spec-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 0.85rem;
  padding: 0.1rem 0;
  gap: 0.5rem;
  min-height: 1.8em;
}

.spec-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem 0;
}

.spec-empty-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.spec-label {
  color: var(--text-light);
  white-space: nowrap;
}

.spec-dots {
  flex-grow: 1;
  border-bottom: 2px dotted #e0e0e0;
  position: relative;
  top: 1rem;
}

.spec-value {
  font-weight: 500;
  text-align: right;
  white-space: normal;
  word-wrap: break-word;
  max-width: 60%;
  line-height: 1.4;
  padding-left: 10px;
  overflow-wrap: break-word;
  hyphens: auto;
}

@media (max-width: 768px) {
  .section-block {
    padding: 16px 12px;
  }

  .section-title {
    font-size: 1.2rem;
  }
}
</style>
