<template>
  <div class="contacts-container">
    <h1 class="page-title" v-scroll-reveal="'fade-in-up'">Контакты</h1>

    <div class="contacts-grid">
      <!-- Основная информация -->
      <div class="contact-card main-info" v-scroll-reveal="'slide-in-left'">
        <h2>ООО «КотлоЭнергоСнаб»</h2>
        <div class="contact-details">
          <div class="contact-item">
            <i class="fas fa-phone"></i>
            <div class="contact-text">
              <p>Тел/факс:</p>
              <a :href="`tel:${contacts.phone[0]}`">{{ contacts.phone[0] }}</a>
              
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
      <div class="contact-card requisites" v-scroll-reveal="'slide-in-right'">
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

          </div>
        </div>
      </div>

      <!-- Карта -->
      <div class="contact-card map-container" v-scroll-reveal="'fade-in-up'">
        <h2 class="map-title"><span class="map-icon"><iconsPoint /></span> Как нас найти</h2>
        
        
        <client-only>
          <div class="map animated-map">
            <!-- Карта через iframe -->
            <div class="map-iframe">
              <iframe 
                src="https://yandex.ru/map-widget/v1/?ll=83.762384%2C53.388259&z=15&l=map&pt=83.762384%2C53.388259%2Cpm2rdm&text=ООО%20«КотлоЭнергоСнаб»" 
                width="100%" 
                height="500" 
                frameborder="0"
                title="Карта ООО «КотлоЭнергоСнаб»"
              ></iframe>
            </div>
            
            <!-- Карточка с информацией о компании -->
            <div class="company-info-card">
              <div class="company-header">
                <div class="company-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 21V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V21M19 21L21 21M19 21H5M5 21L3 21M9 7H15M9 11H15M9 15H15M9 19H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="company-title">
                  <h3>ООО «КотлоЭнергоСнаб»</h3>
                  <span class="status-badge open">Открыто</span>
                </div>
              </div>
              
              <div class="company-details">
                <div class="detail-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.657 16.657L13.414 20.9C13.039 21.275 12.525 21.485 12 21.485C11.475 21.485 10.961 21.275 10.586 20.9L6.343 16.657C5.22422 15.5381 4.46234 14.1127 4.15369 12.5608C3.84504 11.009 4.00349 9.40047 4.60901 7.93853C5.21452 6.4766 6.2399 5.22433 7.55548 4.34668C8.87107 3.46903 10.4178 3.00024 12 3.00024C13.5822 3.00024 15.1289 3.46903 16.4445 4.34668C17.7601 5.22433 18.7855 6.4766 19.391 7.93853C19.9965 9.40047 20.155 11.009 19.8463 12.5608C19.5377 14.1127 18.7758 15.5381 17.657 16.657Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M15 11C15 12.6569 13.6569 14 12 14C10.3431 14 9 12.6569 9 11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>Бриллиантовая, 2е ст1, 1 этаж</span>
                </div>
                
                <div class="detail-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>Восточный м-н, Октябрьский район, Барнаул, 656037</span>
                </div>
                
                <div class="detail-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>Сегодня c 08:00 до 17:00</span>
                </div>
              </div>
              
              <div class="company-actions">
                <a href="tel:+73852500000" class="action-btn call-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L7.96701 10.5165C9.06925 12.9612 11.0388 14.9308 13.4835 16.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Позвонить
                </a>
                <a href="https://yandex.ru/maps/-/CCUQ4XgKhB" target="_blank" rel="noopener" class="action-btn route-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 20L3 17V4L9 7M9 20L15 17M9 20V7M15 17L21 20V7L15 4M15 17V4M9 7L15 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Маршрут
                </a>
              </div>
            </div>
          </div>
        </client-only>
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
  width: 100%;
  height: 500px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

/* Iframe карта */
.map-iframe {
  width: 100%;
  height: 600px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.map-iframe iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* Карточка с информацией о компании */
.company-info-card {
  position: absolute;
  top: 20px;
  left: 20px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 320px;
  z-index: 10;
  animation: slideInCard 0.6s ease-out;
}

@keyframes slideInCard {
  from {
    opacity: 0;
    transform: translateX(-20px) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0) translateY(0);
  }
}

.company-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.company-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #007bff, #0056b3);
  border-radius: 8px;
  color: white;
  flex-shrink: 0;
}

.company-title h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  line-height: 1.3;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.open {
  background: #d4edda;
  color: #155724;
}

.company-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  line-height: 1.4;
  color: #666;
}

.detail-item svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: #007bff;
}

.company-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  flex: 1;
  justify-content: center;
}

.call-btn {
  background: #007bff;
  color: white;
}

.call-btn:hover {
  background: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.route-btn {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #e9ecef;
}

.route-btn:hover {
  background: #e9ecef;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.map-title {
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #007bff;
  gap: 0.5em;
}

.map-icon {
  font-size: 1.6em;
  color: #e31e24;
}

.animated-map {
  animation: fadeInMap 1.2s cubic-bezier(0.4,0,0.2,1);
}

@keyframes fadeInMap {
  from { 
    opacity: 0; 
    transform: translateY(30px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

.map-btn {
  display: inline-block;
  background: #007bff;
  color: #fff !important;
  padding: 0.7em 1.5em;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1em;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(0,123,255,0.12);
  transition: background 0.2s, box-shadow 0.2s;
  margin-top: 0.5em;
}

.map-btn:hover {
  background: #0056b3;
  box-shadow: 0 4px 16px rgba(0,86,179,0.18);
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
  
  .company-info-card {
    position: relative;
    top: auto;
    left: auto;
    max-width: 100%;
    margin-bottom: 16px;
    animation: none;
  }
  
  .company-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .map {
    height: 400px;
  }
  
  .map-title {
    font-size: 1.1rem;
  }
  
  .company-info-card {
    padding: 16px;
  }
  
  .company-title h3 {
    font-size: 14px;
  }
  
  .detail-item {
    font-size: 12px;
  }
}
</style> 