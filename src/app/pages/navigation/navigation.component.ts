import { Component, ViewChild, inject } from '@angular/core';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { AsyncPipe, NgIf } from '@angular/common';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    AsyncPipe,
    NgIf
  ],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private router = inject(Router);
  
  currentUser$ = this.authService.currentUser$;
  
  cartItemCount$: Observable<number> = this.authService.currentUser$.pipe(
    switchMap(user => {
      if (!user) return of(0);
      return this.cartService.getCart().pipe(
        map(cart => cart?.itemCount || 0)
      );
    })
  );

  toggleSidenav() {
    this.sidenav.toggle();
  }

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  async navigateToCart(): Promise<void> {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.router.navigate(['/cart']);
    } else {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: '/cart' } 
      });
    }
  }
}