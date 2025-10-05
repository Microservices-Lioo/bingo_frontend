import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { handleError } from '../../core/errors';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { IAwardShared } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class AwardServiceShared {
    url: string = environment.apiUrl + environment.apiMSAwardUrl;
  
  constructor(
    private http: HttpClient
  ) { }
  
  //* Obtener los premios de un evento por ID
  getAwards(eventId: string): Observable<IAwardShared[]> {
    return this.http.get<IAwardShared[]>(`${this.url}/event/${eventId}`)
        .pipe(catchError(handleError));
  }

  //* Actualizar premio por ID
  updateAward(awardId: string, gameId: string, cardId: string): Observable<IAwardShared> {
    return this.http.patch<IAwardShared>(`${this.url}/${awardId}`, { gameId, winner: cardId })
        .pipe(catchError(handleError));
  }
}
