<template>
  <section class="contact-section">
    <div class="container">
      <h1>Оставить заявку</h1>
      <form @submit.prevent="submitForm" novalidate>
        <div class="form-group">
          <label for="name">Имя</label>
          <input
            id="name"
            v-model="name"
            type="text"
            required
            placeholder="Ваше имя"
          />
        </div>
        <div class="form-group">
          <label for="phone">Телефон</label>
          <input
            id="phone"
            v-model="phone"
            type="tel"
            required
            placeholder="Ваш телефон"
          />
        </div>
        <div class="form-group">
          <label for="email">E-mail</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="Ваш e-mail"
          />
        </div>
        <div class="form-group">
          <label for="message">Сообщение</label>
          <textarea
            id="message"
            v-model="message"
            rows="4"
            placeholder="Ваш вопрос или комментарий"
          ></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Отправить</button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRuntimeConfig } from "#app";

const name = ref("");
const phone = ref("");
const email = ref("");
const message = ref("");

const config = useRuntimeConfig();
// config.telegramBotToken и config.telegramChatId нужно прописать в nuxt.config
const modalStore = useModalStore();
async function submitForm() {
  const payload = {
    text: `📩 Новая заявка:
- Имя: ${name.value}
- Телефон: ${phone.value}
- E-mail: ${email.value}
- Сообщение: ${message.value}`,
  };

  try {
    const res = await $fetch("/api/contact", {
      method: "POST",
      body: payload,
    });
    console.log("Telegram response:", res);
    
    modalStore.showSuccess(`Сообщение "${message.value}" Успешно отправленно!`)
    name.value = '';
    phone.value = '';
    email.value = '';
    message.value = '';
  } catch (err) {
    console.error("Ошибка отправки:", err);
    modalStore.showError(`Ошибка отправки ${err}`)
  }
}
</script>

<style lang="scss" scoped>
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
