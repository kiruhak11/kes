<template>
  <div class="feedback">
    <h2 class="feedback__title">Обратная связь</h2>
    <form @submit.prevent="onSubmit" class="feedback__form">
      <div class="form-group">
        <label>Имя</label>
        <input v-model="form.name" type="text" required />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input v-model="form.email" type="email" required />
      </div>
      <div class="form-group">
        <label>Телефон</label>
        <input v-model="form.phone" type="tel" required />
      </div>
      <div class="form-group">
        <label>Сообщение</label>
        <textarea v-model="form.message" required></textarea>
      </div>
      <button type="submit">Отправить</button>
    </form>
    <p v-if="status" class="feedback__status">{{ status }}</p>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";

interface FeedbackForm {
  name: string;
  email: string;
  phone: string;
  message: string;
}
const form = reactive<FeedbackForm>({
  name: "",
  email: "",
  phone: "",
  message: "",
});
const status = ref("");

async function onSubmit() {
  try {
    await $fetch("/api/feedback", { method: "POST", body: form });
    status.value = "Спасибо! Ваша заявка отправлена.";
    Object.assign(form, { name: "", email: "", phone: "", message: "" });
  } catch {
    status.value = "Ошибка при отправке. Попробуйте позже.";
  }
}
</script>

<style lang="scss" scoped>
.feedback {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem 1rem;

  @media (min-width: 768px) {
    padding: 3rem 0;
  }

  &__title {
    font-size: 1.75rem;
    margin-bottom: 1.5rem;
    text-align: center;
    color: var(--text);

    @media (min-width: 768px) {
      font-size: 2rem;
      margin-bottom: 2rem;
    }
  }

  &__form {
    .form-group {
      display: flex;
      flex-direction: column;
      margin-bottom: 1rem;

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
        font-size: 0.95rem;
        width: 100%;
        transition: border-color 0.2s;

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

    button {
      display: block;
      width: 100%;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      font-size: 0.95rem;
      margin-top: 0.5rem;
      border-radius: 0.5rem;
      background: var(--primary);
      color: white;
      border: none;
      cursor: pointer;
      transition: background-color 0.2s;

      @media (min-width: 768px) {
        font-size: 1rem;
        margin-top: 1rem;
      }

      &:hover {
        background: var(--accent);
      }
    }
  }

  &__status {
    margin-top: 1rem;
    text-align: center;
    font-weight: 500;
    font-size: 0.95rem;
    color: var(--text);

    @media (min-width: 768px) {
      font-size: 1rem;
    }
  }
}
</style>
