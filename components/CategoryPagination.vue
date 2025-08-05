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
<style scoped lang="scss">
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
</style>
