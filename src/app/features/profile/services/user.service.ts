import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { handleError } from '../../../core/errors';
import { UpdateIUser } from '../interfaces';
import { IUser } from '../../../core/interfaces';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  url: string = environment.apiUrl + environment.apiMSAuthUrl;

  constructor(
    private http: HttpClient,
    private authServ: AuthService
  ) {
  }

  //* Obtener un usuario
  getUser(id: string): Observable<IUser> {
    return this.http.get<IUser>(this.url+'/id/'+id )
      .pipe(catchError(handleError));
  }

  updateUser(user: UpdateIUser): Observable<IUser> {
    const currentUser = this.authServ.currentUser;

    return this.http.put<IUser>(`${this.url}/${currentUser.id}`, user)
    .pipe(catchError(handleError));
  }

}
