import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const userServ = inject(UserService);
  const router = inject(Router);

  const token = localStorage.getItem('access_token');
  const refresh_token = localStorage.getItem('refresh_token');

  if (token) {
    userServ.verifyToken(token).subscribe({
      next: (result) => {
        if (result) {
          return router.navigate(['/home']).then(() => false);
        } else {
          if ( refresh_token ) {
            return userServ.refreshToken().subscribe({
              next: (newToken: string) => {
                localStorage.setItem('access_token', newToken);
                return router.navigate(['/home']).then(() => false);
              }
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
