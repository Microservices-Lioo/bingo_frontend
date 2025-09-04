import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { IEventAwards, IPagination } from '../../core/interfaces';
import { environment } from '../../../environments/environment';
import { handleError } from '../../core/errors';
import { StatusEvent } from '../enums';
import { EventUpdateSharedInterface, IEventWithBuyer, IEvent } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class EventServiceShared {
  url: string = environment.apiUrl + environment.apiMSEventUrl;

  constructor(
    private http: HttpClient
  ) { }

  updateStatusEvent(eventId: string, updateEven: EventUpdateSharedInterface): Observable<IEvent> {
    return this.http.patch<IEvent>(this.url + `/status/${eventId}`, updateEven)
      .pipe(catchError(handleError));
  }

  eventListStatus(status: StatusEvent, pagination: { limit?: number, page?: number }): Observable<IPagination<IEventWithBuyer>> {
    return this.http.get<IPagination<IEventWithBuyer>>(`${this.url}/status/${status}`, { params: pagination })
      .pipe(catchError(handleError));
  }

  eventListByUserStatus(status: StatusEvent, pagination: { limit?: number, page?: number }): Observable<IPagination<IEventWithBuyer>> {
    return this.http.get<IPagination<IEventWithBuyer>>(`${this.url}/user/status/${status}`, { params: pagination })
      .pipe(catchError(handleError));
  }

  getEventWithAwards(eventId: string, userId: string): Observable<IEventAwards> {
    return this.http.get<IEventAwards>(`${this.url}/awards/${eventId}/${userId}` )
      .pipe(catchError(handleError));
  }

  getUserRoleEvent(eventId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.url}/is-admin/${eventId}`)
    .pipe(catchError(handleError));
  }
}
