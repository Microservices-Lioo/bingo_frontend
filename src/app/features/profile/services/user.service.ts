import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { handleError } from '../../../core/errors';
import { UpdateIUser } from '../interfaces';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services';
import { IUserShared } from '../../../shared/interfaces';

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
  getUser(id: string): Observable<IUserShared> {
    return this.http.get<IUserShared>(this.url+'/id/'+id )
      .pipe(catchError(handleError));
  }

  //* Actualizar un usuario
  updateUser(user: UpdateIUser): Observable<IUserShared> {
    const currentUser = this.authServ.currentUser;

    return this.http.put<IUserShared>(`${this.url}/${currentUser.id}`, user)
    .pipe(catchError(handleError));
  }

}
