<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <button class="modal-close" @click="closeModal">×</button>
      
      <h2 class="modal-title">Заказать обратный звонок</h2>
      
      <form @submit.prevent="submitForm" class="callback-form">
        <div class="form-group">
          <label for="name">Ваше имя *</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            placeholder="Введите ваше имя"
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
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="Введите ваш email"
          />
        </div>

        <div class="form-group">
          <label for="message">Сообщение</label>
          <textarea
            id="message"
            v-model="form.message"
            rows="4"
            placeholder="Опишите ваш запрос"
          ></textarea>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="form.agreement"
              required
            />
            <span>Я согласен на обработку персональных данных *</span>
          </label>
        </div>

        <button
          type="submit"
          class="btn btn-primary btn-large"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Отправка...' : 'Отправить' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const form = ref({
  name: '',
  phone: '',
  email: '',
  message: '',
  agreement: false
})

const isSubmitting = ref(false)

function closeModal() {
  emit('close')
}

async function submitForm() {
  try {
    isSubmitting.value = true
    
    // Here you would typically make an API call to submit the form
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated API call
    
    // Reset form
    form.value = {
      name: '',
      phone: '',
      email: '',
      message: '',
      agreement: false
    }
    
    // Close modal
    closeModal()
    
    // Show success message (you might want to implement a toast notification system)
    alert('Спасибо! Мы свяжемся с вами в ближайшее время.')
  } catch (error) {
    console.error('Error submitting form:', error)
    alert('Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #fff;
  border-radius: 8px;
  padding: 40px;
  position: relative;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  line-height: 1;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.modal-close:hover {
  background-color: #f5f5f5;
}

.modal-title {
  font-size: 1.5rem;
  margin-bottom: 30px;
  text-align: center;
}

.callback-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin-top: 4px;
}

.checkbox-label span {
  font-size: 14px;
  color: #666;
}

.btn-large {
  width: 100%;
  margin-top: 10px;
}

@media (max-width: 768px) {
  .modal-content {
    padding: 30px 20px;
  }
  
  .modal-title {
    font-size: 1.25rem;
    margin-bottom: 20px;
  }
  
  .form-group input,
  .form-group textarea {
    font-size: 14px;
  }
}
</style> 