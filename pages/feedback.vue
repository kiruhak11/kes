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
  &__title {
    font-size: 2rem;
    margin-bottom: 1rem;
    text-align: center;
  }
  &__form {
    .form-group {
      display: flex;
      flex-direction: column;
      margin-bottom: 1rem;
      label {
        margin-bottom: 0.25rem;
      }
      input,
      textarea {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
        resize: vertical;
      }
    }
    button {
      display: block;
      width: 100%;
    }
  }
  &__status {
    margin-top: 1rem;
    text-align: center;
    font-weight: bold;
  }
}
</style>
