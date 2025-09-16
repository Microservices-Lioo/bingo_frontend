import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services';

export const authGuard: CanActivateFn = (route, state) => {
  const authServ = inject(AuthService);
  const router = inject(Router);

  authServ.isLoggedIn$.subscribe({
    next: (value) => {
      if (value) {
        return true;
      } else {
        return router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url }}).then(() => false);
      }
    },
    error: (error) => {
      console.error(error);
      return router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url }}).then(() => false);
    }
  });

  return true;

};
