<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <button class="modal-close" @click="closeModal">×</button>
      
      <div class="product-info">
        <div class="product-image">
          <img :src="product.images?.[0] || product.image || '/images/placeholders/product-placeholder.png'" :alt="product.name || 'Product'">
        </div>
        <div class="product-details">
          <h2>{{ product.name || 'Без названия' }}</h2>
          <div class="product-specs">
            <div v-for="spec in (Array.isArray(product.specs) ? product.specs.slice(0, 4) : product.specs ? Object.entries(product.specs).slice(0, 4).map(([key, value]) => ({ key, value })) : [])" :key="spec.key">
              <span class="spec-label">{{ spec.key }}:</span>
              <span class="spec-value">{{ spec.value }}</span>
            </div>
          </div>
          <p class="product-description">{{ product.description || product.extendedDescription || 'Описание отсутствует' }}</p>
        </div>
      </div>

      <form @submit.prevent="submitForm" class="contact-form">
        <h3>Заказать коммерческое предложение</h3>
        
        <div class="form-group">
          <label for="name">Ваше имя *</label>
          <input 
            type="text" 
            id="name" 
            v-model="formData.name" 
            required
            placeholder="Введите ваше имя"
          >
        </div>

        <div class="form-group">
          <label for="phone">Телефон *</label>
          <input 
            type="tel" 
            id="phone" 
            v-model="formData.phone" 
            required
            placeholder="+7 (___) ___-__-__"
          >
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="formData.email"
            placeholder="Введите ваш email"
          >
        </div>

        <div class="form-group">
          <label for="message">Комментарий</label>
          <textarea 
            id="message" 
            v-model="formData.message"
            placeholder="Дополнительная информация"
            rows="4"
          ></textarea>
        </div>

        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? 'Отправка...' : 'Отправить заявку' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import { useModalStore } from '~/stores/modal'

interface Product {
  id: number
  name: string | null
  description: string | null
  extendedDescription?: string | null
  price: number | null
  image: string | null
  category_id: string | null
  category_name?: string
  category_slug?: string
  category?: string
  slug?: string
  specs?: {
    power?: any
    fuel?: any
    [key: string]: any
  }
  additional_images?: string[] | null
  images?: string[]
}

const props = defineProps<{
  isOpen: boolean
  product: Product
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const formData = ref({
  name: '',
  phone: '',
  email: '',
  message: ''
})

const isSubmitting = ref(false)
const modalStore = useModalStore()

const closeModal = () => {
  emit('close')
}

const submitForm = async () => {
  try {
    isSubmitting.value = true
    
    const text = `
Новая заявка на коммерческое предложение:

Товар: ${props.product.name || 'Без названия'}
Имя: ${formData.value.name}
Телефон: ${formData.value.phone}
Email: ${formData.value.email}
Комментарий: ${formData.value.message || 'Не указан'}
    `.trim()

    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text })
    })

    if (!response.ok) {
      throw new Error('Failed to submit form')
    }

    // Очищаем форму и закрываем модальное окно
    formData.value = {
      name: '',
      phone: '',
      email: '',
      message: ''
    }
    closeModal()
    
    // Показываем уведомление об успехе через modalStore
    modalStore.showSuccess('Спасибо! Ваша заявка принята. Мы свяжемся с вами в ближайшее время.')
  } catch (error) {
    console.error('Error submitting form:', error)
    modalStore.showError('Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже.')
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
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.product-info {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.product-image img {
  width: 100%;
  height: auto;
  border-radius: 4px;
  object-fit: cover;
}

.product-details h2 {
  margin: 0 0 1rem;
  font-size: 1.5rem;
}

.product-specs {
  margin-bottom: 1rem;
}

.spec-item {
  margin-bottom: 0.5rem;
}

.spec-label {
  font-weight: bold;
  margin-right: 0.5rem;
}

.product-description {
  color: #666;
  line-height: 1.5;
}

.contact-form {
  border-top: 1px solid #eee;
  padding-top: 2rem;
}

.contact-form h3 {
  margin: 0 0 1.5rem;
  font-size: 1.25rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group textarea {
  resize: vertical;
}

.submit-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.submit-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

@media (max-width: 768px) {
  .product-info {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
    padding: 1rem;
  }
}
</style> 