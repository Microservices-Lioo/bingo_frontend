import { Injectable, signal } from '@angular/core';
import { UserModel } from '../models';
import { LoginInterface, RegisterInterface } from '../interfaces';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';
import { handleError } from '../errors';
import { AuthInterface } from '../interfaces/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  url: string = environment.apiUrl + 'auth';
  private currentUserSubject: BehaviorSubject<UserModel> = new BehaviorSubject({} as UserModel);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  get currentUser(): UserModel {
    return this.currentUserSubject.value;
  }

  login(loginInterface: LoginInterface): Observable<AuthInterface> {
    return this.http.post<AuthInterface>(`${this.url}/log-in`, loginInterface)
      .pipe(catchError(handleError));
  }

  setCurrentUser(user: UserModel) {
    this.currentUserSubject.next(user);
  }

  register(registerInterface: RegisterInterface): Observable<AuthInterface> {
    return this.http.post<AuthInterface>(`${this.url}/sign-up`, registerInterface)
      .pipe(catchError(handleError));
  }

  verifyToken(token: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.url}/verify-token`, { token })
    .pipe(catchError(handleError));
  }

  refreshToken(): Observable<string> {
    const refresh_token = localStorage.getItem('refresh_token');

    if ( !refresh_token ) {
      this.logOut();
      return throwError(() => handleError);
    }

    return this.http.post<{ refresh_token: string }>(`${this.url}/refresh-token`, { refresh_token })
    .pipe(
      map(response => response.refresh_token ),
      tap((newAccessToken: string) => {
        localStorage.setItem('access_token', newAccessToken);
      }),
      catchError(error => {
        this.logOut();
        return throwError(() => error);
      })
    );
  }

  logOut() {
    localStorage.clear();
    this.currentUserSubject.complete();
    this.router.navigate(['/', 'auth']);
  }
}
