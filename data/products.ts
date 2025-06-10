// data/products.ts

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
}

// Изначальный каталог (можно пустой)
export const products: Product[] = [
  { id: 1, name: "Котёл A", description: "Описание A", price: 100000 },
  { id: 2, name: "Котёл B", description: "Описание B", price: 150000 },
];
