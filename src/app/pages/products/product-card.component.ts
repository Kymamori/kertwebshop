import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PricePipe } from '../../shared/price.pipe';
import { MatDialog } from '@angular/material/dialog';
import { CartDialogComponent } from '../../shared/cart-dialog.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, PricePipe, CartDialogComponent],
  template: `
    <mat-card class="product-card">
      <mat-icon class="product-placeholder">spa</mat-icon>
      <mat-card-title>{{ product.name }}</mat-card-title>
      <mat-card-content>
        <p>{{ product.description }}</p>
        <p><strong>{{ product.price | price }}</strong></p>
      </mat-card-content>
      <mat-card-actions>
        <button mat-raised-button color="primary" (click)="onAddToCart()">
          Kosárba
        </button>
      </mat-card-actions>
    </mat-card>
  `,

})
export class ProductCardComponent {
  @Input() product!: { name: string; description: string; price: number };

  @Output() addToCart = new EventEmitter<void>();


  constructor(private dialog: MatDialog) {}

  onAddToCart() {
    this.addToCart.emit();
    this.dialog.open(CartDialogComponent, {
      width: '300px',
      data: { product: this.product }
    });
  }
}
