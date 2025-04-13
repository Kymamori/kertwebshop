import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from './product-card.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule,ProductCardComponent],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent {
  products = [
    { name: 'Cserép', description: 'Kerámia virágcserép', price: 990 },
    { name: 'Locsolókanna', description: 'Fém kanna 5L', price: 2490 },
    { name: 'Virágföld', description: '10L univerzális virágföld', price: 790 }
  ];

  onProductAdded(product: any) {
    console.log('Kosárba téve:', product);
  }
}
