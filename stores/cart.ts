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

export const useCartStore = defineStore("cart", () => {
  const STORAGE_KEY = "cart-items";

  // Загружаем данные из localStorage при инициализации
  const items = ref<CartItem[]>([]);

  // Функция загрузки из localStorage
  const loadFromStorage = (): void => {
    if (process.client) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedItems = JSON.parse(stored);
          items.value = Array.isArray(parsedItems) ? parsedItems : [];
        }
      } catch (error) {
        console.error("Ошибка загрузки корзины из localStorage:", error);
        items.value = [];
      }
    }
  };

  // Функция сохранения в localStorage
  const saveToStorage = (): void => {
    if (process.client) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value));
      } catch (error) {
        console.error("Ошибка сохранения корзины в localStorage:", error);
      }
    }
  };

  const totalItems = computed(() => {
    return items.value.reduce(
      (sum: number, item: CartItem): number => sum + item.quantity,
      0
    );
  });

  const totalPrice = computed(() => {
    return items.value.reduce(
      (sum: number, item: CartItem): number => sum + item.price * item.quantity,
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

    // Сохраняем в localStorage
    saveToStorage();

    // @ts-ignore
    ym(103178484, "reachGoal", "ADD_TO_CART");
    console.log("ADD_TO_CART");
  }

  function removeItem(productId: number): void {
    const index = items.value.findIndex(
      (item: CartItem): boolean => item.id === productId
    );
    if (index > -1) {
      items.value.splice(index, 1);
    }

    // Сохраняем в localStorage
    saveToStorage();

    // @ts-ignore
    ym(103178484, "reachGoal", "REMOVE_IN_CART");
    console.log("REMOVE_IN_CART");
  }

  function updateQuantity(productId: number, quantity: number): void {
    const item = items.value.find(
      (item: CartItem): boolean => item.id === productId
    );
    if (item) {
      item.quantity = Math.max(1, quantity);
    }

    // Сохраняем в localStorage
    saveToStorage();
  }

  const clearCart = (): void => {
    items.value = [];
    // Очищаем localStorage
    saveToStorage();
  };

  // Загружаем данные при инициализации store
  if (process.client) {
    loadFromStorage();
  }

  return {
    items,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    loadFromStorage, // Экспортируем для явного вызова при необходимости
  };
});
