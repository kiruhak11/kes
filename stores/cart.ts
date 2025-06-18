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
            this.items = JSON.parse(savedItems)
          } catch (e) {
            console.error('Failed to parse cart items from localStorage:', e)
            this.items = []
          }
        }
      }
    },

    addItem(product: CartItem): void {
      const existingItem = this.items.find((item: CartItem): boolean => item.id === product.id)
      
      if (existingItem) {
        existingItem.quantity++
      } else {
        this.items.push({
          ...product,
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