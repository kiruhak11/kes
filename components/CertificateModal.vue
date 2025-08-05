<template>
  <div v-if="certificate" class="cert-modal" @click="closeModal">
    <div class="cert-modal-content" @click.stop>
      <button class="cert-modal-close" @click="closeModal">&times;</button>
      <h3 class="cert-modal-title">{{ certificate.title }}</h3>
      <img
        :src="certificate.image"
        :alt="certificate.title"
        class="cert-modal-img"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Certificate {
  id: number;
  title: string;
  image: string;
}

interface Props {
  certificate: Certificate | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

const closeModal = () => {
  emit("close");
};
</script>

<style scoped lang="scss">
.cert-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.cert-modal-content {
  background: #fff;
  border-radius: 16px;
  padding: 32px 24px 24px 24px;
  max-width: 96vw;
  max-height: 90vh;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cert-modal-close {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  font-size: 2.2rem;
  color: #e31e24;
  cursor: pointer;
  z-index: 2;
}

.cert-modal-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 18px;
  color: #e31e24;
  text-align: center;
}

.cert-modal-img {
  max-width: 80vw;
  max-height: 60vh;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(227, 30, 36, 0.13);
  background: #fff6f6;
  border: 2px solid #e31e24;
}

@media (max-width: 600px) {
  .cert-modal-content {
    padding: 12px 4px 8px 4px;
  }

  .cert-modal-title {
    font-size: 1rem;
    margin-bottom: 10px;
  }

  .cert-modal-img {
    max-width: 96vw;
    max-height: 40vh;
  }
}
</style>
