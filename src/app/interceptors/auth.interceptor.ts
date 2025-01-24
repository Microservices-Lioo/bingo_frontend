import { isPlatformServer } from '@angular/common';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { UserService } from '../services/user.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const authServ = inject(UserService);

  if (isPlatformServer(platformId)) return next(req);

  const access_token = localStorage.getItem('access_token');
  const refresh_token = localStorage.getItem('refresh_token');
  let headers = req.headers.set('Content-Type', 'application/json');

  if (access_token && refresh_token) {
    headers = headers.set('Authorization', `Bearer ${access_token}`);
  }

  const authReq = req.clone({ headers });


  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if ((error.status == 401 || error.status == 403) && (error.error.error == 'invalid_token' || error.error.error == 'invalid_refresh_token') && refresh_token) {
        return authServ.refreshToken().pipe(
          switchMap(newToken => {
            if (!newToken) return throwError(() => new Error('No se puede actualizar el token'));

            localStorage.setItem('access_token', newToken);
            const updateHeaders = req.headers.set('Authorization', `Bearer ${newToken}`);
            const newRequest = req.clone({ headers: updateHeaders });

            return next(newRequest);
          })
        )
      }
      if ( (error.status == 401 || error.status == 403) && error.error.error == 'cannot_modify_user' ) {
        authServ.logOut();
      }
      
      return throwError(() => error);
    })
  );
};
