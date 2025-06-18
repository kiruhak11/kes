<template>
  <div class="contacts-container">
    <h1 class="page-title">Контакты</h1>

    <div class="contacts-grid">
      <!-- Основная информация -->
      <div class="contact-card main-info">
        <h2>ООО «КотлоЭнергоСнаб»</h2>
        <div class="contact-details">
          <div class="contact-item">
            <i class="fas fa-phone"></i>
            <div class="contact-text">
              <p>Тел/факс:</p>
              <a :href="`tel:${contacts.phone}`">{{ contacts.phone }}</a>
              
            </div>
          </div>
          
          <div class="contact-item">
            <i class="fas fa-envelope"></i>
            <div class="contact-text">
              <p>E-mail:</p>
              <a :href="`mailto:${contacts.email}`">{{ contacts.email }}</a>
            </div>
          </div>

          <div class="contact-item">
            <i class="fas fa-map-marker-alt"></i>
            <div class="contact-text">
              <p>Адрес:</p>
              <span>656012, Алтайский край {{ contacts.address }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Реквизиты -->
      <div class="contact-card requisites">
        <h2>Реквизиты</h2>
        <div class="requisites-content">
          <div class="requisites-group">
            <p><strong>ИНН:</strong> 2223969441</p>
            <p><strong>КПП:</strong> 222401001</p>
            <p><strong>ОГРН:</strong> 1092223000726</p>
            <p><strong>ОКПО:</strong> 60750285</p>
            <p><strong>ОКВЭД:</strong> 51.70</p>
          </div>

          <div class="requisites-group">
            <h3>Банковские реквизиты</h3>
            <div class="bank-details">
              <p><strong>Алтайское отделение № 8644 ПАО Сбербанк</strong></p>
              <p>г.Барнаул (656038, г Барнаул, проспект Комсомольский, д 106 а)</p>
              <p>Р/С 40702810502000002131</p>
              <p>К/С 30101810200000000604</p>
              <p>БИК 040173604</p>
            </div>

            <div class="bank-details">
              <p><strong>Банк «ЛЕВОБЕРЕЖНЫЙ» (ПАО)</strong></p>
              <p>г. Новосибирск</p>
              <p>Р/С 40702810009520000562</p>
              <p>К/С 30101810100000000850</p>
              <p>БИК 045004850</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Карта -->
      <div class="contact-card map-container">
        <h2>Как нас найти</h2>
        <div class="map">
          <iframe 
            src="https://static-maps.yandex.ru/v1?ll=53.388598,83.762407&z=16&l=map&pt=53.388598,83.762407,pm2rdm&apikey=fb86c542-071d-40a4-86e8-2a7f52e79259" 
            width="100%" 
            height="450" 
            style="border:0;" 
            allowfullscreen="" 
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { contacts } from '~/data/contacts';

definePageMeta({
  layout: 'default'
})
</script>

<style scoped>
.contacts-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 3rem;
  color: #333;
}

.contacts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.contact-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.contact-card h2 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #007bff;
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.contact-item i {
  font-size: 1.5rem;
  color: #007bff;
  margin-top: 0.25rem;
}

.contact-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contact-text a {
  color: #007bff;
  text-decoration: none;
  transition: color 0.3s ease;
}

.contact-text a:hover {
  color: #0056b3;
}

.requisites-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.requisites-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.requisites-group h3 {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.bank-details {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 0.5rem;
}

.bank-details p {
  margin: 0.5rem 0;
}

.map-container {
  grid-column: 1 / -1;
}

.map {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .contacts-grid {
    grid-template-columns: 1fr;
  }

  .contact-card {
    padding: 1.5rem;
  }

  .page-title {
    font-size: 2rem;
  }
}
</style> 