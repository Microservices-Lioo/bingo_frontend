import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject, catchError, Observable, ReplaySubject } from 'rxjs';
import { EventAwardPagination, IEventAwards, IEvent, UpdateEvent, ICreateEventAwards } from '../interfaces';
import { HttpClient } from '@angular/common/http';
import { handleError } from '../../../core/errors';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  url: string = environment.apiUrl + environment.apiMSEventUrl;
  private readonly eventSubject = new ReplaySubject<IEvent>();
  public event$ = this.eventSubject.asObservable();

  constructor(
    private http: HttpClient
  ) { }

  // ======= Http =======
  //* Crear un evento con sus premios definidos
  createEventAwards(createEventAwards: ICreateEventAwards): Observable<IEventAwards> {
    return this.http.post<IEventAwards>(this.url, createEventAwards )
      .pipe(catchError(handleError));
  }

  //* Actualizar un evento
  updateEvent(id: string, updateEven: UpdateEvent): Observable<IEvent> {
    return this.http.patch<IEvent>(this.url + `/${id}`, updateEven )
      .pipe(catchError(handleError));
  }

  //* Eliminar un evento
  deleteEvent(id: string): Observable<any> {
    return this.http.delete(this.url + `/${id}`).pipe(catchError(handleError));
  }

  //* Obtener el evento con sus premios
  getEventWithAwards(eventId: string): Observable<IEventAwards> {
    return this.http.get<IEventAwards>(`${this.url}/${eventId}/awards`)
      .pipe(catchError(handleError));
  }

  //* Obtener los eventos de un usuario con sus premios
  getEventsByUserWithAwards(limit?: number, page?: number): Observable<EventAwardPagination> {
    const pagination: {limit?: number, page?: number} = { limit, page };
    return this.http.get<EventAwardPagination>(this.url + '/user/awards', { params: pagination} )
      .pipe(catchError(handleError));
  }

  // ======= Subject =======
  //* Enviar un evento seleccionado
  sendSeleted(event: IEvent) {
    this.eventSubject.next(event);
  }
}
