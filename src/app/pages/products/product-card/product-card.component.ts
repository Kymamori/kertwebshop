// product-card.component.ts
import { Component, Input } from '@angular/core';
import { Product } from '../../../models/product.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../services/cart.service';
import { MatDialog } from '@angular/material/dialog';
import { CartDialogComponent } from '../../../shared/cart-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {
  @Input() product!: Product;

  constructor(
    private cartService: CartService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  async addToCart() {
    try {
      await this.cartService.addItem(this.product);
      this.dialog.open(CartDialogComponent, {
        data: { product: this.product },
        width: '400px'
      });
    } catch (error) {
      // The error will be caught here if user was redirected to login
      // No need to show error message since they're being redirected
    }
  }
}