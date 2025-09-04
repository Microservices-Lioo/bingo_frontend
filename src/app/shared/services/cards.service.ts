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

  getCardCountForUserAndEvent(eventId: string): Observable<number> {
    return this.http.get<number>(`${this.url}/count/user/${eventId}`)
      .pipe(catchError(handleError));
  }

  findToEventByBuyer(eventId: string): Observable<ICardShared[]> {
    return this.http.get<ICardShared[]>(`${this.url}/buyer/event/${eventId}`)
      .pipe(catchError(handleError));
  }

  checkOrUncheckBoxCard(cardId: string, markedNum: number, marked?: boolean): Observable<ICardNumsShared | null> {
    return this.http.post<ICardNumsShared | null>(`${this.url}/check-or.uncheck/${cardId}`, { markedNum, marked })
      .pipe(catchError(handleError));
  }

  getCardByIdBuyerEvent(eventId: string, cardId: string, buyer: string): Observable<ICardNumsShared[][]> {
    return this.http.get<ICardNumsShared[][]>(`${this.url}/${cardId}/${buyer}/${eventId}`)
      .pipe(catchError(handleError));
  }
}
