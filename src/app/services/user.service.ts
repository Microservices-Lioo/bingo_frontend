import { Injectable, signal } from '@angular/core';
import { UserModel } from '../models';
import { LoginInterface, RegisterInterface } from '../interfaces';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, catchError, Observable } from 'rxjs';
import { handleError } from '../errors';
import { AuthInterface } from '../interfaces/auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  url: string = environment.apiUrl + 'auth/';
  private currentUserSubject: BehaviorSubject<UserModel> = new BehaviorSubject({} as UserModel);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient
  ) { }

  get currentUser(): UserModel {
    return this.currentUserSubject.value;
  }

  login(loginInterface: LoginInterface): Observable<AuthInterface> {
    return this.http.post<AuthInterface>(`${this.url}log-in`, loginInterface)
      .pipe(catchError(handleError));
  }

  setCurrentUser(user: UserModel) {
    this.currentUserSubject.next(user);
  }

  register(registerInterface: RegisterInterface): Observable<AuthInterface> {
    return this.http.post<AuthInterface>(`${this.url}sign-up`, registerInterface)
      .pipe(catchError(handleError));
  }

  logOut() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    // this.currentUserSubject.next(null);
  }
}
