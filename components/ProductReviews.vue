<template>
  <div
    v-if="activeTab === 'reviews'"
    class="section-block reviews-block"
    v-scroll-reveal="'fade-in-up'"
  >
    <h2 class="section-title">Отзывы о продукции</h2>
    <div class="review-card" v-scroll-reveal="'slide-in-left'">
      <div class="review-author">Иван Петров</div>
      <div class="review-text">
        Отличный котел, быстро доставили и помогли с установкой!
      </div>
    </div>
    <div class="review-card" v-scroll-reveal="'slide-in-right'">
      <div class="review-author">ООО "ТеплоСервис"</div>
      <div class="review-text">
        Работаем с этим заводом не первый год, всегда всё на высшем уровне.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  activeTab: string;
}

defineProps<Props>();
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

.reviews-block {
  background: #f7f7fa;
}

.review-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  padding: 18px 16px;
  margin-bottom: 12px;
}

.review-author {
  font-weight: bold;
  color: #ff6b6b;
  margin-bottom: 6px;
}

.review-text {
  color: #333;
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
