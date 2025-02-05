import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map } from 'rxjs';
import { AuthService } from '../../features/auth/services';

export const authGuard: CanActivateFn = (route, state) => {
  const authServ = inject(AuthService);
  const router = inject(Router);

  const token = localStorage.getItem('access_token');

  if (!token) return router.navigate(['/auth/login']).then(() => false);

  // Validar token
  authServ.verifyToken(token).pipe(
    map((result) => {
      return result ? true : router.navigate(['/auth/login']).then(() => false);
    }),
    catchError((error) => {
      return router.navigate(['/auth/login']).then(() => false);
    })
  );

  return true;

};
