import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { handleError } from '../../core/errors';
import { EStatusEventShared } from '../enums';
import { IEventUpdateShared, IEventWithBuyer, IEventShared, IEventAwardsShared, IPagination } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class EventServiceShared {
  url: string = environment.apiUrl + environment.apiMSEventUrl;

  constructor(
    private http: HttpClient
  ) { }

  updateStatusEvent(eventId: string, updateEven: IEventUpdateShared): Observable<IEventShared> {
    return this.http.patch<IEventShared>(this.url + `/status/${eventId}`, updateEven)
      .pipe(catchError(handleError));
  }

  eventListStatus(status: EStatusEventShared, pagination: { limit?: number, page?: number }): Observable<IPagination<IEventWithBuyer>> {
    return this.http.get<IPagination<IEventWithBuyer>>(`${this.url}/status/${status}`, { params: pagination })
      .pipe(catchError(handleError));
  }

  eventListByUserStatus(status: EStatusEventShared, pagination: { limit?: number, page?: number }): Observable<IPagination<IEventWithBuyer>> {
    return this.http.get<IPagination<IEventWithBuyer>>(`${this.url}/user/status/${status}`, { params: pagination })
      .pipe(catchError(handleError));
  }

  //* Obtener el evento con sus premios
  getEventWithAwards(eventId: string): Observable<IEventAwardsShared> {
    return this.http.get<IEventAwardsShared>(`${this.url}/${eventId}/awards`)
      .pipe(catchError(handleError));
  }

  //* Verificar si el usuario es el dueño del evento
  getUserRoleEvent(eventId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.url}/is-admin/${eventId}`)
      .pipe(catchError(handleError));
  }
}
