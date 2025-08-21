// Плагин для гидратации корзины на клиенте
export default defineNuxtPlugin(() => {
  const cartStore = useCartStore();

  // Загружаем корзину из localStorage при инициализации
  cartStore.loadFromStorage();
});
