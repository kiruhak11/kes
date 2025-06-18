<template>
  <FrogModalWrapper
    :desktop-position="'center'"
    :mobile-position="'bottom'"
    mobile-swipe-to-close
    class="callback-modal"
  >
    <template #header>
      <div class="modal-header">
        <h2>Заказать звонок</h2>
      </div>
    </template>

    <form @submit.prevent="submitForm" class="callback-form">
      <div class="form-group">
        <label for="name">Имя *</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          placeholder="Ваше имя"
        />
      </div>
      <div class="form-group">
        <label for="phone">Телефон *</label>
        <input
          id="phone"
          v-model="form.phone"
          type="tel"
          required
          placeholder="+7 (___) ___-__-__"
        />
      </div>
      <div class="form-group">
        <label for="message">Сообщение</label>
        <textarea
          id="message"
          v-model="form.message"
          rows="4"
          placeholder="Ваше сообщение"
        ></textarea>
      </div>
      <button type="submit" class="btn btn-primary">Отправить</button>
    </form>
  </FrogModalWrapper>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FrogModalWrapper from 'rubillex_frog-modal'
import { useModalStore } from '../stores/modal'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const form = ref({
  name: '',
  phone: '',
  message: ''
})

const modalStore = useModalStore()

const submitForm = async () => {
  try {
    const payload = {
      text: `📞 Заказ звонка:
- Имя: ${form.value.name}
- Телефон: ${form.value.phone}
- Сообщение: ${form.value.message || 'не указано'}`
    };

    await $fetch('/api/contact', {
      method: 'POST',
      body: payload
    });

    emit('update:modelValue', false)
    form.value = {
      name: '',
      phone: '',
      message: ''
    }
    modalStore.showSuccess('Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.')
  } catch (error) {
    console.error('Error submitting form:', error)
    modalStore.showError(`Ошибка при отправке заявки: ${error}`)
  }
}
</script>

<style scoped>
.callback-modal {
  min-width: 300px;
  max-width: 500px;
  background: var(--color-background);
  border-radius: 8px;
  padding: 20px;
}

.modal-header {
  text-align: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--color-text);
}

.callback-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: var(--color-text);
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

button {
  width: 100%;
}
</style> 