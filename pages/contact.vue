<template>
  <section class="contact-section">
    <div class="container">
      <h1 v-scroll-reveal="'fade-in-up'">Оставить заявку</h1>
      
      <!-- Показываем выбранную услугу, если она передана -->
      <div v-if="selectedService" class="selected-service" v-scroll-reveal="'fade-in-up'">
        <div class="service-badge">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Выбранная услуга: <strong>{{ selectedService }}</strong></span>
          <button @click="selectedService = ''" class="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      <form @submit.prevent="submitForm" novalidate v-scroll-reveal="'fade-in-up'">
        <div class="form-group" v-scroll-reveal="'slide-in-left'">
          <label for="name">Имя</label>
          <input
            id="name"
            v-model="name"
            type="text"
            required
            placeholder="Ваше имя"
          />
        </div>
        <div class="form-group" v-scroll-reveal="'slide-in-right'">
          <label for="phone">Телефон</label>
          <input
            id="phone"
            v-model="phone"
            type="tel"
            required
            placeholder="Ваш телефон"
          />
        </div>
        <div class="form-group" v-scroll-reveal="'slide-in-left'">
          <label for="email">E-mail</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="Ваш e-mail"
          />
        </div>
        <div class="form-group" v-scroll-reveal="'slide-in-right'">
          <label for="message">Сообщение</label>
          <textarea
            id="message"
            v-model="message"
            rows="4"
            placeholder="Ваш вопрос или комментарий"
          ></textarea>
        </div>
        <button type="submit" class="btn btn-primary" v-scroll-reveal="'zoom-in'">Отправить</button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useModalStore } from "~/stores/modal";
import { useRoute } from "vue-router";

const name = ref("");
const phone = ref("");
const email = ref("");
const message = ref("");
const selectedService = ref("");

const route = useRoute();
const modalStore = useModalStore();

// Получаем параметр service из URL при загрузке страницы
onMounted(() => {
  const serviceParam = route.query.service;
  if (serviceParam && typeof serviceParam === 'string') {
    selectedService.value = decodeURIComponent(serviceParam);
  }
});

async function submitForm() {
  const payload = {
    text: `📩 Новая заявка:
- Имя: ${name.value}
- Телефон: ${phone.value}
- E-mail: ${email.value}
${selectedService.value ? `- Услуга: ${selectedService.value}` : ''}
- Сообщение: ${message.value}`,
  };

  try {
    const res = await $fetch("/api/contact", {
      method: "POST",
      body: payload,
    });

    modalStore.showSuccess(`Сообщение "${message.value}" успешно отправлено!`);
    name.value = "";
    phone.value = "";
    email.value = "";
    message.value = "";
    selectedService.value = "";
  } catch (err) {
    console.error("Ошибка отправки:", err);
    modalStore.showError(`Ошибка отправки: ${err}`);
  }
}
</script>

<style lang="scss" scoped>
.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: auto;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;

}
.contact-section {
  padding: 2rem 1rem;

  @media (min-width: 768px) {
    padding: 4rem 0;
  }

  .container {
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
  }

  h1 {
    margin-bottom: 1.5rem;
    text-align: center;
    color: var(--text);
    font-size: 1.75rem;

    @media (min-width: 768px) {
      font-size: 2rem;
      margin-bottom: 2rem;
    }
  }

  .selected-service {
    margin-bottom: 2rem;
    
    .service-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #dc3545, #c82333);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 0.95rem;
      box-shadow: 0 2px 8px rgba(220, 53, 69, 0.2);
      
      svg {
        flex-shrink: 0;
      }
      
      strong {
        font-weight: 600;
      }
    }
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    @media (min-width: 768px) {
      gap: 1.5rem;
    }
  }

  .form-group {
    display: flex;
    flex-direction: column;

    label {
      margin-bottom: 0.5rem;
      font-weight: 500;
      font-size: 0.95rem;

      @media (min-width: 768px) {
        font-size: 1rem;
      }
    }

    input,
    textarea {
      padding: 0.75rem;
      border: 1px solid var(--secondary);
      border-radius: 0.5rem;
      background: var(--bg);
      color: var(--text);
      transition: border-color 0.2s;
      font-size: 0.95rem;
      width: 100%;

      @media (min-width: 768px) {
        font-size: 1rem;
      }

      &:focus {
        border-color: var(--accent);
        outline: none;
      }
    }

    textarea {
      min-height: 120px;
      resize: vertical;
    }
  }

  button.btn {
    align-self: center;
    width: 100%;
    max-width: 180px;
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    font-size: 0.95rem;
    margin-top: 0.5rem;

    @media (min-width: 768px) {
      font-size: 1rem;
      margin-top: 1rem;
    }
  }
}
</style>
