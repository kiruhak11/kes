// data/products.ts

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
}

// Изначальный каталог (можно пустой)
export const products: Product[] = [];
