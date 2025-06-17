<template>
  <div class="certificates-page">
    <h1>Сертификаты</h1>
    <div class="certificates-grid">
      <div
        v-for="cert in certificates"
        :key="cert.id"
        class="certificate-item"
        @click="openCertificate(cert)"
      >
        <img :src="cert.image" :alt="cert.title" />
        <div class="certificate-title">{{ cert.title }}</div>
      </div>
    </div>

    <FrogModalWrapper
      v-if="selectedCertificate"
      :desktop-position="FrogModalWrapperPosition.CENTER"
      :mobile-position="FrogModalWrapperPosition.BOTTOM"
      mobile-swipe-to-close
      class="certificate-modal"
      @close="selectedCertificate = null"
    >
      <template #header>
        <div class="modal-header">
          <h3>{{ currentCertificate.title }}</h3>
        </div>
      </template>

      <div class="modal-content">
        <img :src="currentCertificate.image" :alt="currentCertificate.title" />
        <p>{{ currentCertificate.description }}</p>
      </div>
    </FrogModalWrapper>
  </div>
</template>

<script setup lang="ts">
interface Certificate {
  id: number
  title: string
  image: string
  description: string
}

const certificates: Certificate[] = [
  {
    id: 1,
    title: 'Сертификат соответствия МКТ',
    image: '/certificates/sert_sootv_MKT.png',
    description: 'Сертификат соответствия на котлы МКТ'
  },
  {
    id: 2,
    title: 'Сертификат на котлы дизельные',
    image: '/certificates/sert_kotl_diz.png',
    description: 'Сертификат на котлы, работающие на дизельном топливе'
  },
  {
    id: 3,
    title: 'Сертификат на котлы газовые',
    image: '/certificates/sert_kotl_gaz.png',
    description: 'Сертификат на котлы, работающие на газовом топливе'
  },
  {
    id: 4,
    title: 'Сертификат на котлы мазутные',
    image: '/certificates/sert_kotl_maz.png',
    description: 'Сертификат на котлы, работающие на мазуте'
  },
  {
    id: 5,
    title: 'Сертификат на котлы газо-мазутные',
    image: '/certificates/sert_kotl_gaz_maz.png',
    description: 'Сертификат на комбинированные газо-мазутные котлы'
  },
  {
    id: 6,
    title: 'Сертификат на котлы угольные',
    image: '/certificates/sert_kotl_ugoln.png',
    description: 'Сертификат на котлы, работающие на угле'
  }
]

const selectedCertificate = ref<Certificate | null>(null)
const currentCertificate = computed(() => selectedCertificate.value || certificates[0])

function openCertificate(cert: Certificate) {
  selectedCertificate.value = cert
}
</script>

<style scoped>
.certificates-page {
  padding: 2rem;
}

.certificates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.certificate-item {
  cursor: pointer;
  transition: transform 0.2s;
  background: var(--color-background-soft);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.certificate-item:hover {
  transform: translateY(-5px);
}

.certificate-item img {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.certificate-title {
  padding: 1rem;
  text-align: center;
  font-weight: 500;
}

.certificate-modal {
  background: var(--color-background);
  border-radius: 8px;
  padding: 20px;
  max-width: 800px;
  width: 90%;
}

.modal-header {
  text-align: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--color-text);
}

.modal-content {
  text-align: center;
}

.modal-content img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  margin-bottom: 1rem;
}

.modal-content p {
  color: var(--color-text);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .certificates-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .certificate-item img {
    height: 200px;
  }
}
</style> 