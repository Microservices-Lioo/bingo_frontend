import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { handleError } from '../../core/errors';

@Injectable({
  providedIn: 'root'
})
export class CardsServiceShared {
  url = environment.apiUrl + environment.apiMSCardUrl;

  constructor(
    private http: HttpClient
  ) { }

  getCardCountForUserAndEvent(eventId: number): Observable<number> {
    return this.http.get<number>(`${this.url}/count/user/${eventId}`)
      .pipe(catchError(handleError));
  }
}
