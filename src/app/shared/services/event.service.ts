import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { EventInterface, PaginationInterface } from '../../core/interfaces';
import { environment } from '../../../environments/environment';
import { handleError } from '../../core/errors';
import { StatusEvent } from '../enums';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  url: string = environment.apiUrl + environment.apiMSEventUrl;

  constructor(
    private http: HttpClient
  ) { }

  eventListStatus(status: StatusEvent, pagination: { limit?: number, page?: number }): Observable<PaginationInterface<EventInterface>> {
    return this.http.get<PaginationInterface<EventInterface>>(`${this.url}/status/${status}`, { params: pagination })
      .pipe(catchError(handleError));
  }

  eventListByUserStatus(status: StatusEvent, pagination: { limit?: number, page?: number }): Observable<PaginationInterface<EventInterface>> {
    return this.http.get<PaginationInterface<EventInterface>>(`${this.url}/by-user/status/${status}`, { params: pagination })
      .pipe(catchError(handleError));
  }
}
