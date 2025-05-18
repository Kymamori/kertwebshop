// src/app/services/product.service.ts
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc } from '@angular/fire/firestore';
import { Product } from '../models/product.model';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators'; // Added all required operators

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private firestore = inject(Firestore);

  // Get all products with debugging
  getProducts(): Observable<Product[]> {
    const productsRef = collection(this.firestore, 'products');
    return collectionData(productsRef, { idField: 'id' }).pipe(
      map((docs: any[]) => docs.map(doc => this.parseProduct(doc))),
      tap(products => console.log('Products loaded:', products)),
      catchError(error => {
        console.error('Error loading products:', error);
        return of([]);
      })
    );
  }

  // Parse Firestore document to Product
  private parseProduct(doc: any): Product {
    return {
      id: doc.id,
      name: doc.name,
      description: doc.description,
      price: doc.price,
      category: doc.category,
      createdAt: doc.createdAt?.toDate() || new Date()
    };
  }

  // Get single product by ID
  getProductById(id: string): Observable<Product> {
    const productRef = doc(this.firestore, `products/${id}`);
    return docData(productRef).pipe(
      map(doc => this.parseProduct({ id, ...doc }))
    ) as Observable<Product>;
  }

  // Get products by category
  getProductsByCategory(category: string): Observable<Product[]> {
    return this.getProducts().pipe(
      map((products: Product[]) => products.filter(
        (p: Product) => p.category === category
      ))
    );
  }

  // Add new product
  async addProduct(productData: Omit<Product, 'id'>): Promise<void> {
    try {
      const productsRef = collection(this.firestore, 'products');
      await addDoc(productsRef, {
        ...productData,
        createdAt: new Date() // Or use serverTimestamp() from @angular/fire/firestore
      });
      console.log('Product added successfully');
    } catch (error) {
      console.error('Error adding product:', error);
      throw error; // Re-throw to handle in component
    }
  }
}