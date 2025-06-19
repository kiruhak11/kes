import { defineStore } from 'pinia'

export interface CartItem {
  id: number
  name: string
  price: number
  image: string
  quantity: number
  category: string
  category_slug: string
  slug: string
}

export interface CartState {
  items: CartItem[]
}

const STORAGE_KEY = 'cart-items'

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: []
  }),

  getters: {
    totalItems: (state: CartState): number => {
      return state.items.reduce((sum: number, item: CartItem): number => sum + item.quantity, 0)
    },
    totalPrice: (state: CartState): number => {
      return state.items.reduce((sum: number, item: CartItem): number => sum + item.price * item.quantity, 0)
    }
  },

  actions: {
    initializeStore() {
      // Проверяем, что мы на клиенте и localStorage доступен
      if (process.client) {
        const savedItems = localStorage.getItem(STORAGE_KEY)
        if (savedItems) {
          try {
            const parsed = JSON.parse(savedItems)
            // Проверяем, что это массив объектов с нужными полями
            if (Array.isArray(parsed) && parsed.every(item => typeof item === 'object' && item !== null && 'id' in item && 'quantity' in item)) {
              this.items = parsed
            } else {
              this.items = []
            }
          } catch (e) {
            console.error('Failed to parse cart items from localStorage:', e)
            this.items = []
          }
        }
      }
    },

    addItem(product: CartItem): void {
      // Делаем глубокую копию, чтобы убрать реактивность
      const plainProduct = JSON.parse(JSON.stringify(product))
      const existingItem = this.items.find((item: CartItem): boolean => item.id === plainProduct.id)
      
      if (existingItem) {
        existingItem.quantity++
      } else {
        this.items.push({
          ...plainProduct,
          quantity: 1
        })
      }
      this.saveToStorage()
    },

    removeItem(productId: number): void {
      const index = this.items.findIndex((item: CartItem): boolean => item.id === productId)
      if (index > -1) {
        this.items.splice(index, 1)
        this.saveToStorage()
      }
    },

    updateQuantity(productId: number, quantity: number): void {
      const item = this.items.find((item: CartItem): boolean => item.id === productId)
      if (item) {
        item.quantity = Math.max(1, quantity)
        this.saveToStorage()
      }
    },

    clearCart(): void {
      this.items = []
      this.saveToStorage()
    },

    saveToStorage(): void {
      if (process.client) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items))
      }
    }
  }
}) 