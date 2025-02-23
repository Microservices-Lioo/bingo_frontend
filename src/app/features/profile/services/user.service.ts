import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { handleError } from '../../../core/errors';
import { UpdateUserInterface } from '../interfaces';
import { UserInterface } from '../../../core/interfaces';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  url: string = environment.apiUrl + environment.apiMSAuthUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authServ: AuthService
  ) {
  }

  getUser(id: number): Observable<UserInterface> {
    return this.http.get<UserInterface>(this.url+'/'+id )
      .pipe(catchError(handleError));
  }

  updateUser(user: UpdateUserInterface): Observable<UserInterface> {
    const currentUser = this.authServ.currentUser;

    return this.http.put<UserInterface>(`${this.url}/${currentUser.id}`, user)
    .pipe(catchError(handleError));
  }

}
