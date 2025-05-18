import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Cart, CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { of } from 'rxjs';

type FirestoreCart = Omit<Cart, 'id'>;

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  currentCart$ = this.cartSubject.asObservable();

  private calculateTotals(cart: Cart): Cart {
    return {
      ...cart,
      itemCount: cart.items.length,
      totalCost: cart.items.reduce((sum, item) => sum + item.price, 0)
    };
  }

  getCart(): Observable<Cart | null> {
    return this.authService.currentUser$.pipe(
      switchMap(user => {
        if (!user) {
          this.router.navigate(['/login']);
          return of(null);
        }
        const cartRef = doc(this.firestore, `carts/${user.uid}`);
        return from(this.getOrCreateCart(cartRef, user.uid));
      }),
      tap(cart => this.cartSubject.next(cart))
    );
  }

  private async getOrCreateCart(cartRef: any, userId: string): Promise<Cart> {
    const cartSnap = await getDoc(cartRef);
    if (cartSnap.exists()) {
      return this.calculateTotals({
        id: cartSnap.id,
        ...(cartSnap.data() as FirestoreCart)
      });
    }
    return this.createEmptyCart(userId);
  }

  private createEmptyCart(userId: string): Cart {
    return {
      id: '', // Will be set when saved to Firestore
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
      return;
    }

    const cartRef = doc(this.firestore, `carts/${user.uid}`);
    const currentCart = this.cartSubject.value || this.createEmptyCart(user.uid);

    if (!currentCart.items.some(item => item.productId === product.id)) {
      const newItem: CartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        category: product.category
      };

      const updatedCart = this.calculateTotals({
        ...currentCart,
        items: [...currentCart.items, newItem]
      });

      await setDoc(cartRef, updatedCart);
      this.cartSubject.next(updatedCart);
    }
  }

  async removeItem(productId: string): Promise<void> {
    const user = await this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    const currentCart = this.cartSubject.value;
    if (!currentCart) return;

    const itemToRemove = currentCart.items.find(item => item.productId === productId);
    if (!itemToRemove) return;

    const updatedItems = currentCart.items.filter(item => item.productId !== productId);
    const updatedCart = this.calculateTotals({
      ...currentCart,
      items: updatedItems
    });

    const cartRef = doc(this.firestore, `carts/${user.uid}`);
    await setDoc(cartRef, updatedCart);
    this.cartSubject.next(updatedCart);
  }

  async clearCart(): Promise<void> {
    const user = await this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    const emptyCart = this.createEmptyCart(user.uid);
    const cartRef = doc(this.firestore, `carts/${user.uid}`);
    await setDoc(cartRef, emptyCart);
    this.cartSubject.next(emptyCart);
  }
}