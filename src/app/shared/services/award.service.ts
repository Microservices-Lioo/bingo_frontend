import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { IAwardShared } from '../interfaces';
import { handleError } from '../../core/errors';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AwardServiceShared {
    url: string = environment.apiUrl + environment.apiMSAwardUrl;
  
  constructor(
    private http: HttpClient
  ) { }

  getAwards(eventId: string): Observable<IAwardShared[]> {
    return this.http.get<IAwardShared[]>(`${this.url}/event/${eventId}`)
        .pipe(catchError(handleError));
  }
}
