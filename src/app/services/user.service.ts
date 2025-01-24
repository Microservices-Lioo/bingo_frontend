import { Injectable } from '@angular/core';
import { LoginInterface, RegisterInterface } from '../interfaces';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';
import { handleError } from '../errors';
import { AuthInterface, UpdateUserInterface, UserInterface } from '../interfaces';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  url: string = environment.apiUrl + 'auth';
  private loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private currentUserSubject: BehaviorSubject<UserInterface> = new BehaviorSubject({} as UserInterface);
  
  isLoggedIn$: Observable<boolean> = this.loggedIn.asObservable();
  currentUser$: Observable<UserInterface> = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const token = localStorage.getItem('access_token');
    const current_user = localStorage.getItem('user');
    
    if ( token && current_user ) {
      const user = JSON.parse(current_user);
      this.setCurrentUser(user);
      this.setLoggedIn(true);
    }
  }

  setCurrentUser(user: UserInterface) {
    this.currentUserSubject.next(user);
  }

  setLoggedIn(value: boolean) {
    this.loggedIn.next(value);
  }

  get currentUser(): UserInterface {
    return this.currentUserSubject.value;
  }

  login(loginInterface: LoginInterface): Observable<AuthInterface> {
    return this.http.post<AuthInterface>(`${this.url}/log-in`, loginInterface)
      .pipe(catchError(handleError));
  }  

  register(registerInterface: RegisterInterface): Observable<AuthInterface> {
    return this.http.post<AuthInterface>(`${this.url}/sign-up`, registerInterface)
      .pipe(catchError(handleError));
  }

  verifyToken(access_token: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.url}/verify-token`, { access_token })
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

  updateUser(user: UpdateUserInterface): Observable<UserInterface> {
    const id = this.currentUser.id;
    return this.http.put<UserInterface>(`${this.url}/${id}`, user)
    .pipe(catchError(handleError));
  }

  logOut() {
    console.log('cerro');
    localStorage.clear();
    this.currentUserSubject.complete();
    this.loggedIn.next(false);
    this.router.navigate(['/', 'auth']);
  }
}
