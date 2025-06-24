export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
  category_slug: string;
  slug: string;
}

export interface CartState {
  items: CartItem[];
}

export const useCartStore = defineStore(
  "cart",
  () => {
    const items = ref<CartItem[]>([]);

    const totalItems = computed(() => {
      return items.value.reduce(
        (sum: number, item: CartItem): number => sum + item.quantity,
        0
      );
    });

    const totalPrice = computed(() => {
      return items.value.reduce(
        (sum: number, item: CartItem): number =>
          sum + item.price * item.quantity,
        0
      );
    });

    function addItem(product: CartItem): void {
      // Делаем глубокую копию, чтобы убрать реактивность
      const plainProduct = JSON.parse(JSON.stringify(product));
      const existingItem = items.value.find(
        (item: CartItem): boolean => item.id === plainProduct.id
      );

      if (existingItem) {
        existingItem.quantity++;
      } else {
        items.value.push({
          ...plainProduct,
          quantity: 1,
        });
      }
    }

    function removeItem(productId: number): void {
      const index = items.value.findIndex(
        (item: CartItem): boolean => item.id === productId
      );
      if (index > -1) {
        items.value.splice(index, 1);
      }
    }

    function updateQuantity(productId: number, quantity: number): void {
      const item = items.value.find(
        (item: CartItem): boolean => item.id === productId
      );
      if (item) {
        item.quantity = Math.max(1, quantity);
      }
    }

    const clearCart = () => {
      items.value = [];
    };

    return {
      items,
      totalItems,
      totalPrice,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    };
  },
  {
    persist: true,
  }
);
