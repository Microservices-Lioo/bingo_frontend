import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const authServ = inject(AuthService);
  const router = inject(Router);

  const token = localStorage.getItem('access_token');
  const refresh_token = localStorage.getItem('refresh_token');

  if (token) {
    authServ.verifyToken(token).subscribe({
      next: (result) => {
        if (result) {
          return router.navigate(['/home']).then(() => false);
        } else {
          if (refresh_token) {
            return authServ.refreshToken().subscribe({
              next: (newToken: string) => {
                localStorage.setItem('access_token', newToken);
                return router.navigate(['/home']).then(() => false);
              },
              error: (err) => {
                return true;
              },
            })
          } else {
            return true;
          }
        }
      },
      error: (error) => {
        return true;
      }
    })
  }

  return true;
};
