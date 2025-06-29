import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError, Observable } from 'rxjs';
import { handleError } from '../../core/errors';
import { DataGameSharedI } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class GamesSharedService {
  private url: string = environment.apiUrl + environment.apiMSGameUrl;

  constructor(
    private http: HttpClient,
  ) { }

  getDataGame(eventId: number): Observable<DataGameSharedI | null> {
    return this.http.get<DataGameSharedI | null>(`${this.url}/event/${eventId}`)
      .pipe(catchError(handleError));
  }

}
