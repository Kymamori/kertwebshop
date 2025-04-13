import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-cart-dialog',
  standalone: true,
  imports: [MatDialogModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      Kosárba téve <mat-icon color="primary">check_circle</mat-icon>
    </h2>
    <div mat-dialog-content>
      A termék <strong>{{ data.product.name }}</strong> sikeresen hozzá lett adva a kosárhoz.
    </div>
  `
})
export class CartDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { product: any }) {}
}
