<template>
  <div v-if="totalPages > 1" class="pagination" v-scroll-reveal="'fade-in-up'">
    <button
      class="pagination-btn pagination-btn--arrow"
      :disabled="currentPage === 1"
      @click="$emit('goToPage', 1)"
      aria-label="Первая страница"
    >
      «
    </button>
    <button
      class="pagination-btn pagination-btn--arrow"
      :disabled="currentPage === 1"
      @click="$emit('goToPage', currentPage - 1)"
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
        @click="$emit('goToPage', page)"
        :disabled="page === currentPage"
      >
        {{ page }}
      </button>
      <span v-else class="pagination-ellipsis">...</span>
    </span>
    <button
      class="pagination-btn pagination-btn--arrow"
      :disabled="currentPage === totalPages"
      @click="$emit('goToPage', currentPage + 1)"
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
      @click="$emit('goToPage', totalPages)"
      aria-label="Последняя страница"
    >
      »
    </button>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{
  currentPage: number;
  totalPages: number;
  visiblePages: number[];
}>();
</script>
