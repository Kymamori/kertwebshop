import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Cart, CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';
import { Observable, from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router'; // Add this import

// Define a type for Firestore cart documents (without the optional id)
type FirestoreCart = Omit<Cart, 'id'>;

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private router = inject(Router); // Inject the Router

  private calculateTotals(cart: Cart): Cart {
    const itemCount = cart.items.length;
    const totalCost = cart.items.reduce((sum, item) => sum + item.price, 0);
    return { ...cart, itemCount, totalCost };
  }

  getCart(): Observable<Cart | null> {
    return this.authService.currentUser$.pipe(
      switchMap(user => {
        if (!user) return of(null); 
        const cartRef = doc(this.firestore, `carts/${user.uid}`);
        return from(this.getOrCreateCart(cartRef, user.uid));
      })
    );
  }

  private async getOrCreateCart(cartRef: any, userId: string): Promise<Cart> {
    const cartSnap = await getDoc(cartRef);
    return cartSnap.exists() ? 
      this.calculateTotals({ 
        id: cartSnap.id, 
        ...(cartSnap.data() as FirestoreCart) 
      }) :
      this.createEmptyCart(userId);
  }

  private createEmptyCart(userId: string): FirestoreCart {
    return {
      userId,
      items: [],
      itemCount: 0,
      totalCost: 0
    };
  }

  async addItem(product: Product): Promise<void> {
    const user = await this.authService.getCurrentUser();
    
    if (!user) {
      this.router.navigate(['/login']);
      throw new Error('Redirecting to login');
    }

    const cartRef = doc(this.firestore, `carts/${user.uid}`);
    const cartSnap = await getDoc(cartRef);
    
    let cart: Cart = cartSnap.exists() ? 
      { 
        id: cartSnap.id, 
        ...(cartSnap.data() as FirestoreCart) 
      } : 
      { 
        ...this.createEmptyCart(user.uid) 
      };

    const productExists = cart.items.some(item => item.productId === product.id);
    
    if (!productExists) {
      const newItem: CartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        category: product.category
      };
      cart.items.push(newItem);
      cart = this.calculateTotals(cart);
      
      // When saving to Firestore, we omit the id
      const { id: _, ...cartData } = cart;
      await setDoc(cartRef, cartData);
    }
  }

    async removeItem(productId: string): Promise<void> {
    const user = await this.authService.getCurrentUser();
    
    if (!user) {
        this.router.navigate(['/login']);
        throw new Error('Redirecting to login');
    }

    const cartRef = doc(this.firestore, `carts/${user.uid}`);
    const cartSnap = await getDoc(cartRef);
    
    if (!cartSnap.exists()) {
        throw new Error('Cart not found');
    }

    const cartData = cartSnap.data() as FirestoreCart;
    const itemToRemove = cartData.items.find(item => item.productId === productId);
    
    if (!itemToRemove) {
        throw new Error('Product not found in cart');
    }

    const updatedItems = cartData.items.filter(item => item.productId !== productId);
    const updatedCart = {
        ...cartData,
        items: updatedItems,
        itemCount: updatedItems.length,
        totalCost: cartData.totalCost - itemToRemove.price
    };

    await setDoc(cartRef, updatedCart);
    }

  async clearCart(): Promise<void> {
    const user = await this.authService.getCurrentUser();
    
    if (!user) {
      throw new Error('Only logged in users can modify cart');
    }

    const cartRef = doc(this.firestore, `carts/${user.uid}`);
    const emptyCart = this.createEmptyCart(user.uid);
    await setDoc(cartRef, emptyCart);
  }
}