// types.ts
export interface RowDefinition {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'file';
  options?: string[];
  isFixed: boolean;
}

export interface ProductData {
  id: number;
  name: string;
  supplier: string;
  // Index signature for dynamic attributes (power, technology, prices, etc.)
  [key: string]: string | number | string[] | boolean | undefined | null;
}

export interface DashboardResponse {
  products: ProductData[];
  rows: RowDefinition[];
  locations: string[];
}

export interface ApiPayload {
  action: 'create_product' | 'update_product' | 'delete_product' | 'update_settings';
  data: unknown;
}