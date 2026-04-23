import { Product } from './product';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity: number, size?: string, color?: string) => void;
  removeItem: (productId: string, size?: string, color?: string) => void;
  updateQty: (productId: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}
