import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { EventAwardsInterface, EventInterface, PaginationInterface } from '../../core/interfaces';
import { environment } from '../../../environments/environment';
import { handleError } from '../../core/errors';
import { StatusEvent } from '../enums';

export interface EventWithBuyerInterface extends EventInterface {
  buyer?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EventServiceShared {
  url: string = environment.apiUrl + environment.apiMSEventUrl;

  constructor(
    private http: HttpClient
  ) { }

  eventListStatus(status: StatusEvent, pagination: { limit?: number, page?: number }): Observable<PaginationInterface<EventWithBuyerInterface>> {
    return this.http.get<PaginationInterface<EventWithBuyerInterface>>(`${this.url}/status/${status}`, { params: pagination })
      .pipe(catchError(handleError));
  }

  eventListByUserStatus(status: StatusEvent, pagination: { limit?: number, page?: number }): Observable<PaginationInterface<EventWithBuyerInterface>> {
    return this.http.get<PaginationInterface<EventWithBuyerInterface>>(`${this.url}/by-user/status/${status}`, { params: pagination })
      .pipe(catchError(handleError));
  }

  getEventWithAwards(eventId: number, userId: number): Observable<EventAwardsInterface> {
    return this.http.get<EventAwardsInterface>(`${this.url}/awards/${eventId}/${userId}` )
      .pipe(catchError(handleError));
  }

  getUserRoleEvent(eventId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.url}/is-admin/${eventId}`)
    .pipe(catchError(handleError));
  }
}
