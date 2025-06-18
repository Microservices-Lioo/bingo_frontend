import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { AwardSharedInterface } from '../interfaces';
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

  getAwards(eventId: number): Observable<AwardSharedInterface[]> {
    return this.http.get<AwardSharedInterface[]>(`${this.url}/event/${eventId}`)
        .pipe(catchError(handleError));
  }
}
