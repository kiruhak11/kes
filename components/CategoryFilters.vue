<template>
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
          >({{ filtersCount }})</span
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
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
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
              @click.stop="$emit('resetFilters')"
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
            <button
              class="reset-all-btn"
              @click.stop="$emit('resetAllFilters')"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0z"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" />
              </svg>
              Сбросить все
            </button>
          </div>
        </div>
        <div class="filters-grid">
          <slot />
        </div>
      </div>
    </transition>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{
  filtersCollapsed: boolean;
  filtersCount: number;
  activeFiltersCount: number;
}>();
const emit = defineEmits([
  "toggleFiltersCollapsed",
  "resetFilters",
  "resetAllFilters",
]);
function toggleFiltersCollapsed() {
  emit("toggleFiltersCollapsed");
}
</script>
<style scoped lang="scss">
@import "~/assets/styles/global/category-filters.scss";
</style>
