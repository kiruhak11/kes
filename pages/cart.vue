<template>
  <section class="container">
    <h1>Корзина</h1>
    
    <div v-if="cartStore.items.length === 0" class="empty-cart">
      <p>Ваша корзина пуста</p>
      <NuxtLink to="/catalog" class="btn btn-primary">Перейти в каталог</NuxtLink>
    </div>

    <div v-else class="cart-content">
      <div class="cart-items">
        <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
          <img :src="item.image" :alt="item.name" class="cart-item-image" />
          <div class="cart-item-details">
            <h3>{{ item.name }}</h3>
            <p class="cart-item-price">{{ item.price.toLocaleString() }} &#8381;</p>
            <div class="cart-item-quantity">
              <button @click="cartStore.updateQuantity(item.id, item.quantity - 1)" class="quantity-btn">-</button>
              <span>{{ item.quantity }}</span>
              <button @click="cartStore.updateQuantity(item.id, item.quantity + 1)" class="quantity-btn">+</button>
            </div>
          </div>
          <button @click="cartStore.removeItem(item.id)" class="remove-btn">×</button>
        </div>
      </div>

      <div class="cart-summary">
        <h2>Оформление заказа</h2>
        <div class="summary-row">
          <span>Товары ({{ cartStore.totalItems }}):</span>
          <span>{{ cartStore.totalPrice.toLocaleString() }} &#8381;</span>
        </div>
        <form @submit.prevent="submitOrder" class="order-form">
          <div class="form-group">
            <label for="name">Имя *</label>
            <input
              id="name"
              v-model="orderForm.name"
              type="text"
              required
              placeholder="Ваше имя"
            />
          </div>
          <div class="form-group">
            <label for="phone">Телефон *</label>
            <input
              id="phone"
              v-model="orderForm.phone"
              type="tel"
              required
              placeholder="Ваш телефон"
            />
          </div>
          <div class="form-group">
            <label for="email">E-mail</label>
            <input
              id="email"
              v-model="orderForm.email"
              type="email"
              placeholder="Ваш e-mail"
            />
          </div>
          <div class="form-group">
            <label for="address">Адрес доставки *</label>
            <textarea
              id="address"
              v-model="orderForm.address"
              required
              rows="3"
              placeholder="Укажите адрес доставки"
            ></textarea>
          </div>
          <div class="form-group">
            <label for="comment">Комментарий к заказу</label>
            <textarea
              id="comment"
              v-model="orderForm.comment"
              rows="3"
              placeholder="Дополнительная информация"
            ></textarea>
          </div>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Отправка...' : 'Оформить заказ' }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCartStore } from '~/stores/cart'

const cartStore = useCartStore()
const isSubmitting = ref(false)

const orderForm = ref({
  name: '',
  phone: '',
  email: '',
  address: '',
  comment: ''
})

async function submitOrder() {
  try {
    isSubmitting.value = true

    const orderItems = cartStore.items.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      total: item.price * item.quantity
    }))

    const payload = {
      text: `🛒 Новый заказ:
- Имя: ${orderForm.value.name}
- Телефон: ${orderForm.value.phone}
- E-mail: ${orderForm.value.email}
- Адрес: ${orderForm.value.address}
- Комментарий: ${orderForm.value.comment || 'нет'}

Товары:
${orderItems.map(item => `- ${item.name} (${item.quantity} шт.) - ${item.total.toLocaleString()} ₽`).join('\n')}

Итого: ${cartStore.totalPrice.toLocaleString()} ₽`
    }

    const res = await $fetch("/api/contact", {
      method: "POST",
      body: payload,
    })

    // Очищаем корзину и форму после успешной отправки
    cartStore.clearCart()
    orderForm.value = {
      name: '',
      phone: '',
      email: '',
      address: '',
      comment: ''
    }

    alert('Спасибо за заказ! Мы свяжемся с вами в ближайшее время.')
  } catch (err) {
    console.error('Ошибка отправки заказа:', err)
    alert('Произошла ошибка при отправке заказа. Пожалуйста, попробуйте позже.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.container {
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text);
}

.empty-cart {
  text-align: center;
  padding: 3rem 0;
}

.empty-cart p {
  margin-bottom: 1rem;
  color: var(--text);
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .cart-content {
    grid-template-columns: 2fr 1fr;
  }
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

.cart-item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.cart-item-details {
  flex: 1;
}

.cart-item-details h3 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
}

.cart-item-price {
  font-weight: bold;
  color: var(--accent);
  margin-bottom: 0.5rem;
}

.cart-item-quantity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-btn {
  width: 24px;
  height: 24px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-btn:hover {
  background: #f5f5f5;
}

.remove-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
}

.remove-btn:hover {
  color: #ff4444;
}

.cart-summary {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cart-summary h2 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.order-form {
  margin-top: 2rem;
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

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent);
}

button[type="submit"] {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  margin-top: 1rem;
}

button[type="submit"]:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style> 