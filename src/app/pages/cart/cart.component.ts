import { Component, inject } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { AsyncPipe, CurrencyPipe, NgIf, NgFor } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    CurrencyPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  private cartService = inject(CartService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  
  cart$ = this.cartService.getCart();

  async removeFromCart(productId: string): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Termék eltávolítása',
        message: 'Biztosan eltávolítja ezt a terméket a kosárból?',
        confirmText: 'Eltávolítás',
        cancelText: 'Mégse'
      }
    });

    const result = await dialogRef.afterClosed().toPromise();
    
    if (result) {
      try {
        await this.cartService.removeItem(productId);
        this.showSnackbar('Termék sikeresen eltávolítva a kosárból', 'success');
      } catch (error) {
        console.error('Error removing item:', error);
        this.showSnackbar('Hiba történt a termék eltávolítása közben', 'error');
        
        // Redirect to login if unauthorized
        if (error instanceof Error && error.message.includes('auth')) {
          this.navigateToLogin();
        }
      }
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: this.router.url } 
    });
  }

  private showSnackbar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Bezár', {
      duration: 3000,
      panelClass: [`${type}-snackbar`]
    });
  }
}