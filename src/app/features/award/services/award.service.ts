import { EditIAward } from './../interfaces/edit-award.interface';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { IAward, ICreateAward, UpdateIAward } from '../interfaces';
import { handleError } from '../../../core/errors';

@Injectable({
  providedIn: 'root'
})
export class AwardService {

  url: string = environment.apiUrl + environment.apiMSAwardUrl;

  constructor(
    private http: HttpClient
  ) { }

  //* Crear un premio
  createAward(createAward: ICreateAward): Observable<IAward> {
    return this.http.post<IAward>(this.url, createAward)
      .pipe(catchError(handleError));
  }
  
  //* Crea muchos premios
  createAwards(createAward: ICreateAward[]): Observable<IAward> {
    return this.http.post<IAward>(this.url + 'many', createAward)
      .pipe(catchError(handleError));
  }

  //*Actualizar un premio
  updateAward(id: string, updateAward: UpdateIAward): Observable<IAward> {
    return this.http.patch<IAward>(this.url + `/${id}`, updateAward)
      .pipe(catchError(handleError));
  }

  getAwardsByEvent(eventId: string): Observable<IAward[]> {
    return this.http.get<IAward[]>(this.url+'/event/' + eventId)
      .pipe(catchError(handleError));
  }

  //* Eliminar un premio
  deleteAward(id: string): Observable<IAward> {
    return this.http.delete<IAward>(this.url + `/${id}`)
      .pipe(catchError(handleError));
  }
}
