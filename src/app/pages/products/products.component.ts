import { Component, inject } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';
import { ProductCardComponent } from './product-card/product-card.component';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, AsyncPipe, MatCardModule, MatButtonModule, ProductCardComponent, MatDialogModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent {
  private productService = inject(ProductService);
  products$: Observable<Product[]> = this.productService.getProducts();
}