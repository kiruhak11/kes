import { useCartStore } from '~/stores/cart'

export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    const cartStore = useCartStore()
    cartStore.initializeStore()
  }
}) 