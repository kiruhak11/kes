import type { Product, Category, NewProduct, Characteristic } from "./product";

export interface NewCategoryForm {
  name: string;
  description: string;
  slug: string;
  images?: string[];
}

export interface AdminCatalogEmits {
  "update:password": [value: string];
  login: [];
  logout: [];
  "add-product": [product: NewProduct];
  "reset-form": [];
  toggle: [id: number];
  "update-with-specs": [id: number, specs: Characteristic[]];
  "cancel-edit": [];
  "add-spec": [spec: Characteristic];
  "remove-spec": [index: number];
  "add-new-spec": [];
  "remove-new-spec": [index: number];
  "delete-product": [id: number];
  "handle-image-upload": [file: File];
  "handle-connection-scheme-upload": [file: File];
  "toggle-new-prod-fuel-dropdown": [];
}

export interface AdminCategoriesEmits {
  "add-category": [category: NewCategoryForm];
  "edit-category": [category: Category];
  "save-category": [category: Category];
  "delete-category": [id: string];
  "delete-empty-categories": [];
  "close-edit-category-modal": [];
  "update:new-category": [value: NewCategoryForm];
  "update:editing-category": [value: Category | null];
  "update:show-add-category-modal": [value: boolean];
  "update:show-edit-category-modal": [value: boolean];
}

export interface AdminStatsEmits {
  "fetch-stats": [];
  "show-request-details": [request: any];
  "close-request-details": [];
  "delete-request": [id: number];
  "delete-all-requests": [];
}
