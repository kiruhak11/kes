<template>
  <div class="questionnaire-page">
    <div class="container">
      <h1 class="page-title" v-scroll-reveal="'fade-in-up'">Опросные листы</h1>
      <p class="page-description" v-scroll-reveal="'fade-in-up'">
        Для подготовки технико-коммерческого предложения, пожалуйста, скачайте и заполните соответствующий опросный лист. 
        Заполненный документ вы можете отправить нам на почту.
      </p>
      
      <div v-if="questionnaires.length === 0" class="no-files" v-scroll-reveal="'fade-in-up'">
        Нет доступных для скачивания опросных листов.
      </div>
      
      <div v-else class="questionnaire-list">
        <a 
          v-for="(file, index) in questionnaires" 
          :key="file.name" 
          :href="file.path" 
          download 
          class="questionnaire-item"
          v-scroll-reveal="index % 2 === 0 ? 'slide-in-left' : 'slide-in-right'"
        >
          <div class="file-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM12 18L8 14H11V11H13V14H16L12 18Z"/>
            </svg>
          </div>
          <span class="file-name">{{ file.name }}</span>
          <div class="download-icon">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z"/>
            </svg>
          </div>
        </a>
      </div>
    </div>

    <div class="commercial-offer-banner" v-scroll-reveal="'fade-in-up'">
      <div class="container">
        <h2 class="banner-title" v-scroll-reveal="'fade-in-up'">Готовы сделать заказ?</h2>
        <p class="banner-description" v-scroll-reveal="'slide-in-left'">
          Отправьте нам заполненный опросный лист или свяжитесь для получения коммерческого предложения.
        </p>
        <NuxtLink to="/contact" class="btn-offer" v-scroll-reveal="'zoom-in'">
          Заказать коммерческое предложение
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Questionnaire {
  name: string;
  path: string;
}

const questionnaires = ref<Questionnaire[]>([
  { name: 'Опросный лист на водоподготовку', path: '/opr/vodopodgotovka.docx' },
  { name: 'Опросный лист на котельную', path: '/opr/kotelnaya.docx' },
  { name: 'Опросный лист на Котлы', path: '/opr/kotly.docx' },
  { name: 'Опросный лист на ТДМ', path: '/opr/tdm.docx' },
  { name: 'Опросный лист на теплообменники', path: '/opr/teploobmenniki.docx' },
]);
</script>

<style scoped>
.questionnaire-page {
  padding: 40px 0 0;
  background-color: #f9f9f9;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #333;
}

.page-description {
  text-align: center;
  font-size: 1.1rem;
  color: #666;
  max-width: 700px;
  margin: 0 auto 2.5rem;
}

.no-files {
  text-align: center;
  color: #777;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  border: 1px dashed #ddd;
}

.questionnaire-list {
  display: grid;
  gap: 1.5rem;
}

.questionnaire-item {
  display: flex;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background-color: #ffffff;
  border-radius: 8px;
  text-decoration: none;
  color: #333;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  border: 1px solid #e0e0e0;
}

.questionnaire-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
}

.file-icon {
  margin-right: 1rem;
  color: var(--primary);
}

.file-icon svg, .download-icon svg {
  width: 28px;
  height: 28px;
}

.file-name {
  font-size: 1.1rem;
  font-weight: 500;
  flex-grow: 1;
}

.download-icon {
  margin-left: 1rem;
  color: #888;
  transition: color 0.2s;
}

.questionnaire-item:hover .download-icon {
  color: var(--primary);
}

.commercial-offer-banner {
  margin-top: 4rem;
  padding: 3.5rem 0;
  background-color: #1a202c;
  text-align: center;
  color: #fff;
}

.banner-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.banner-description {
  font-size: 1.1rem;
  color: #e2e8f0;
  max-width: 650px;
  margin: 0 auto 2.5rem;
  line-height: 1.6;
}

.btn-offer {
  display: inline-block;
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: var(--primary);
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.btn-offer:hover {
  background-color: var(--primary-dark, #c51a1f);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}
</style>
