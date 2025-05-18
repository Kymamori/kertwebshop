// src/app/auth/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  return authService.currentUser$.pipe(
    map(user => {
      if (user) return true;
      
      // Redirect to login with return URL
      router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return false;
    })
  );
};