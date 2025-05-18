// src/app/models/product.model.ts
export interface Product {
  id: string;               // Firestore document ID
  name: string;
  description: string;
  price: number;
  category: string;
  createdAt: Date; 
}
