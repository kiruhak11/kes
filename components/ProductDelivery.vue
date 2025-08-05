<template>
  <div
    v-if="activeTab === 'delivery'"
    class="section-block"
    v-scroll-reveal="'slide-in-left'"
  >
    <h2 class="section-title">Комплект поставки</h2>
    <div
      v-if="deliverySet"
      class="delivery-set-content"
      v-html="deliverySet.replace(/\\n/g, '<br>')"
    ></div>
    <div v-else class="no-data-message">
      Информация о комплекте поставки уточняется.
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  activeTab: string;
  deliverySet?: string;
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

.delivery-set-content {
  line-height: 1.6;
  white-space: pre-wrap;
}

.no-data-message {
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
}
</style>
