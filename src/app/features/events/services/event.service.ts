import { Injectable, signal } from '@angular/core';
import { EventModel } from '../models';
import { environment } from '../../../../environments/environment';
import { catchError, Observable } from 'rxjs';
import { CreateEvent, EventAwardPagination, EventAwardsInterface, EventInterface, UpdateEvent } from '../interfaces';
import { HttpClient } from '@angular/common/http';
import { handleError } from '../../../core/errors';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  url: string = environment.apiUrl + environment.apiMSEventUrl;

  constructor(
    private http: HttpClient
  ) { }

  createEvent(createEvent: CreateEvent): Observable<EventInterface> {
    return this.http.post<EventInterface>(this.url, createEvent )
      .pipe(catchError(handleError));
  }

  updateEvent(id: number, updateEven: UpdateEvent): Observable<EventInterface> {
    return this.http.patch<EventInterface>(this.url + `/${id}`, updateEven )
      .pipe(catchError(handleError));
  }

  deleteEvent(id: number): Observable<any> {
    return this.http.delete(this.url + `/${id}`).pipe(catchError(handleError));
  }

  getEventWithAwards(eventId: number): Observable<EventAwardsInterface> {
    return this.http.get<EventAwardsInterface>(this.url + '/awards/'+eventId )
      .pipe(catchError(handleError));
  }

  getEventsByUserWithAwards(limit?: number, page?: number): Observable<EventAwardPagination> {
    const pagination: {limit?: number, page?: number} = { limit, page };
    return this.http.get<EventAwardPagination>(this.url + '/for-user/awards', { params: pagination} )
      .pipe(catchError(handleError));
  }
}
