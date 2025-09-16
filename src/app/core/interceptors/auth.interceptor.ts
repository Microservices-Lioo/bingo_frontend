import { isPlatformServer } from '@angular/common';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../features/auth/services';
import { UtilsService } from '../../shared/services/utils.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const authServ = inject(AuthService);
  const utilsServ = inject(UtilsService)

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
      if (error.status === 401) {
        if (access_token && refresh_token) {
          return authServ.refreshToken().pipe(
            switchMap(newToken => {
              if (!newToken) return throwError(() => new Error('No se puede actualizar el token'));
              const updateHeaders = req.headers.set('Authorization', `Bearer ${newToken}`);
              const newRequest = req.clone({ headers: updateHeaders });

              return next(newRequest);
            })
          )
        }
        // } else {
        //   authServ.logOut();
        // }
      } else if (error.status == 403) {
        utilsServ.goForbidden();
      }

      return throwError(() => error);
    })
  );
};
