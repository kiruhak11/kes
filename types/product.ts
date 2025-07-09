export interface Characteristic {
  id: number;
  key: string;
  value: string;
  show_in_filters?: boolean;
}

export interface BaseProduct {
  id: number;
  name: string;
  description: string;
  extendedDescription?: string;
  price: number;
  image: string;
  category_id?: string;
  category_name?: string;
  category_slug?: string;
  category?: string | null;
  slug?: string;
  specs?: Characteristic[];
  additional_images?: string[];
  images?: string[];
  delivery_set?: string;
  connection_scheme?: string;
  additional_requirements?: string;
  required_products?: number[];
  gallery?: {
    images?: string[];
  };
}

export interface Product extends Omit<BaseProduct, "category"> {
  category?: string | null;
  category_id?: string;
  category_name?: string;
  category_slug?: string;
}

export interface NewProduct {
  name: string;
  description: string;
  extendedDescription?: string;
  price: number;
  image: string;
  category: string;
  category_id?: string;
  category_name?: string;
  category_slug?: string;
  slug?: string;
  specs?: Characteristic[];
  additional_images?: string[];
  images?: string[];
  delivery_set?: string;
  connection_scheme?: string;
  additional_requirements?: string;
  required_products?: number[];
  gallery?: {
    images?: string[];
  };
}

export interface AdminProduct
  extends Omit<
    BaseProduct,
    | "id"
    | "name"
    | "description"
    | "price"
    | "image"
    | "category_id"
    | "category"
  > {
  id?: number;
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  category_id?: string;
  category?: string;
}

export interface ProductApiResponse {
  success: boolean;
  product: Product;
}

export interface CategoryApiResponse {
  categories: Category[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  images?: string[];
}
