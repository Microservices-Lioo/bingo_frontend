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
  url: string = environment.apiUrl + 'auth';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authServ: AuthService
  ) {
    const token = localStorage.getItem('access_token');
    const current_user = localStorage.getItem('user');
  }



  updateUser(user: UpdateUserInterface): Observable<UserInterface> {
    const currentUser = this.authServ.currentUser;

    return this.http.put<UserInterface>(`${this.url}/${currentUser.id}`, user)
    .pipe(catchError(handleError));
  }

}
