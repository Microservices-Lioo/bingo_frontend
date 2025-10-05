import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { handleError } from '../../core/errors';
import {  ICardNumsShared, ICardShared } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class CardsServiceShared {
  url = environment.apiUrl + environment.apiMSCardUrl;

  constructor(
    private http: HttpClient
  ) { }

  //* Obtener el numero de tablas de bingo compradas por un usuario
  numberCardsToUserFromEvent(eventId: string): Observable<number> {
    return this.http.get<number>(`${this.url}/count/user/${eventId}`)
      .pipe(catchError(handleError));
  }

  //* Buscar las tablas de bingo (cards) de un comprador
  findToEventByBuyer(eventId: string): Observable<ICardShared[]> {
    return this.http.get<ICardShared[]>(`${this.url}/buyer/event/${eventId}`)
      .pipe(catchError(handleError));
  }

  //* Marcar o desmarcar una celda de una tabla de bingo
  checkOrUncheckBoxCard(cardId: string, markedNum: number, marked: boolean): Observable<ICardShared | null> {
    return this.http.post<ICardShared | null>(`${this.url}/check-or-uncheck/${cardId}`, { markedNum, marked })
      .pipe(catchError(handleError));
  }

  //* Obtener una card por el Id
  getCardById(cardId: string): Observable<ICardShared> {
    return this.http.get<ICardShared>(`${this.url}/${cardId}`)
      .pipe(catchError(handleError));
  }

  //* Obtener una card por el Id
  resetCards(eventId: string, ids: string[]): Observable<ICardShared[]> {
    return this.http.patch<ICardShared[]>(`${this.url}/reset/event/${eventId}`, ids)
      .pipe(catchError(handleError));
  }
}
