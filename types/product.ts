export interface Characteristic {
  id: number;
  key: string;
  value: string;
  show_in_filters?: boolean;
}

export interface Product {
  id: number;
  name: string | null;
  description: string | null;
  extendedDescription?: string | null;
  price: number | null;
  image: string | null;
  category_id: string | null;
  category_name?: string;
  category_slug?: string;
  category?: string;
  slug?: string;
  specs?: Characteristic[];
  additional_images?: string | string[] | null;
  images?: string[];
  delivery_set?: string | null;
  connection_scheme?: string | null;
  gallery?: {
    images?: string[];
  };
}
