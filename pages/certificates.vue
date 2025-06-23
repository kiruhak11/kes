<template>
  <div class="container" v-scroll-reveal="'fade-in'">
    <h1 class="page-title" v-scroll-reveal="'slide-in-left'">Сертификаты</h1>
    <div class="certificates-grid">
      <div v-for="certificate in certificates" :key="certificate.id" 
           class="certificate-card"
           v-scroll-reveal="'zoom-in'"
           @click="openModal(certificate)">
        <div class="certificate-card__inner">
          <!-- Certificate Image -->
          <div class="certificate-card__image">
            <img 
              :src="certificate.image" 
              :alt="certificate.title"
            />
          </div>
          
          <!-- Card Content -->
          <div class="certificate-card__content">
            <h3 class="certificate-card__title">{{ certificate.title }}</h3>
            <button class="btn btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Просмотреть
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="selectedCertificate" 
         class="modal"
         @click="closeModal">
      <div class="modal__content" @click.stop>
        <button 
          @click="closeModal"
          class="modal__close"
        >
          <span>&times;</span>
        </button>
        <div class="modal__header">
          <h2 class="modal__title">{{ selectedCertificate.title }}</h2>
        </div>
        <div class="modal__body">
          <img 
            :src="selectedCertificate.image" 
            :alt="selectedCertificate.title"
            class="modal__image"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Certificate {
  id: number;
  title: string;
  image: string;
}

const certificates: Certificate[] = [

  {
    id: 1,
    title: 'Сертификат на газовые котлы',
    image: '/certificates/dek_gaz.png'
  },
  {
    id: 2,
    title: 'Сертификат на водогрейные котлы на твердом и жидком топливе',
    image: '/certificates/dek_kotly.png'
  },
  {
    id: 3,
    title: 'Декларация о соответствии тягодутьевые машины',
    image: '/certificates/dek_tyag.png'
  },
  {
    id: 4,
    title: 'Декларация о соответствии оборудование пылеулавливающее',
    image: '/certificates/dek_pil.png'
  },
  {
    id: 5,
    title: 'Декларация о соответствии блочно-модульной котельной',
    image: '/certificates/dek_mod.png'
  }
];

const selectedCertificate = ref<Certificate | null>(null);

const openModal = (certificate: Certificate) => {
  selectedCertificate.value = certificate;
};

const closeModal = () => {
  selectedCertificate.value = null;
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  text-align: center;
  margin-bottom: 40px;
  font-size: 2.5rem;
  color: #333;
}

.certificates-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 80px;
  padding: 60px 0;
}

.certificate-card {
  cursor: pointer;
  perspective: 1000px;
  height: 100%;
}

.certificate-card__inner {
  position: relative;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: visible;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  padding-top: 80px;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
}

.certificate-card:hover .certificate-card__inner {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.certificate-card__image {
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  width: 140px;
  height: 140px;
  z-index: 2;
  background: #fff;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid #e31e24;
}

.certificate-card__image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.certificate-card__content {
  padding: 20px;
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.certificate-card__title {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #333;
  min-height: 3em;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  text-align: center;
  transition: all 0.3s ease;
  text-decoration: none;
  margin-top: auto;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: #e31e24;
  color: #fff;
}

.btn-primary:hover {
  background: #c41820;
}

.icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}

/* Modal styles */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px 20px 20px;
}

.modal__content {
  position: relative;
  max-width: 900px;
  width: 100%;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  margin: auto;
}

.modal__close {
  position: absolute;
  top: 15px;
  right: 15px;
  color: #fff;
  font-size: 2rem;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  z-index: 2;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  transition: background-color 0.3s ease;
}

.modal__close:hover {
  background: rgba(0, 0, 0, 0.7);
}

.modal__header {
  padding: 20px;
  background: #f8f8f8;
  border-bottom: 1px solid #e0e0e0;
}

.modal__title {
  font-size: 1.5rem;
  color: #333;
  text-align: center;
  margin: 0;
}

.modal__body {
  padding: 30px;
}

.modal__image {
  display: block;
  margin: 0 auto;
  max-width: 100vw;
  max-height: 80vh;
  width: auto;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  object-fit: contain;
}

/* Responsive styles */
@media (max-width: 1200px) {
  .certificates-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 60px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 100px 15px 30px;
  }
  
  .certificates-grid {
    grid-template-columns: 1fr;
    gap: 50px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .certificate-card__image {
    width: 100px;
    height: 100px;
    top: -40px;
  }
  
  .certificate-card__inner {
    padding-top: 60px;
  }
  
  .certificate-card__title {
    font-size: 1.2rem;
    margin-bottom: 15px;
  }
  
  .btn {
    padding: 8px 16px;
    font-size: 0.9rem;
  }

  .modal {
    padding: 70px 15px 15px;
  }
  
  .modal__body {
    padding: 20px;
    /* убираем ограничение по высоте */
  }
  .modal__image {
    max-width: 98vw;
    max-height: 60vh;
    width: auto;
    height: auto;
  }
}
</style> 