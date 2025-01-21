import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

export const authGuard: CanActivateFn = (route, state) => {
  const userServ = inject(UserService);
  const router = inject(Router);

  const token = localStorage.getItem('access_token');
  const refresh_token = localStorage.getItem('refresh_token');
  
  
  // Validar token
  if (token) {
    userServ.verifyToken(token!).subscribe({
      next: (result) => {
        return result;
      },
      error: (error) => {
        return router.navigate(['/auth']).then(() => false);
      }
    });
  }

  // refrescar el token
  if (refresh_token) {
    userServ.refreshToken().subscribe({
      next: (newToken) => {
        localStorage.setItem('access_token', newToken);
        return true;
      },
      error: (err) => {
        return router.navigate(['/auth']).then(() => false);
      },
    })
  }

  return router.navigate(['/auth']).then(() => false);
};
