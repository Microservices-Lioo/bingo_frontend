import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { handleError } from '../../core/errors';
import { CardNumsSharedI, CardSharedI } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class CardsServiceShared {
  url = environment.apiUrl + environment.apiMSCardUrl;

  constructor(
    private http: HttpClient
  ) { }

  getCardCountForUserAndEvent(eventId: number): Observable<number> {
    return this.http.get<number>(`${this.url}/count/user/${eventId}`)
      .pipe(catchError(handleError));
  }

  findToEventByBuyer(eventId: number): Observable<CardSharedI[]> {
    return this.http.get<CardSharedI[]>(`${this.url}/buyer/event/${eventId}`)
      .pipe(catchError(handleError));
  }

  checkOrUncheckBoxCard(cardId: number, markedNum: number, marked?: boolean): Observable<CardNumsSharedI | null> {
    return this.http.post<CardNumsSharedI | null>(`${this.url}/check-or.uncheck/${cardId}`, { markedNum, marked })
      .pipe(catchError(handleError));
  }

  getCardByIdBuyerEvent(eventId: number, cardId: number, buyer: number): Observable<CardNumsSharedI[][]> {
    return this.http.get<CardNumsSharedI[][]>(`${this.url}/${cardId}/${buyer}/${eventId}`)
      .pipe(catchError(handleError));
  }
}
