// src/app/models/cart.model.ts
export interface Cart {
  id?: string;  // Make id clearly optional
  userId: string;
  items: CartItem[];
  itemCount: number;
  totalCost: number;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  category: string;
}