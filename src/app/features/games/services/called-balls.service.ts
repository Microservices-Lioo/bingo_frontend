import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { handleError } from '../../../core/errors';
import { catchError, Observable } from 'rxjs';
import { CalledBallI } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class CalledBallsService {
  private urlCalledBall = environment.apiUrl + environment.apiMSCalledBallUrl;
  
  constructor(
    private http: HttpClient
  ) { }

  unrepeatableTableNumberRaffle(gameId: number, eventId: number): Observable<CalledBallI | null> {
    return this.http.post<CalledBallI | null>(this.urlCalledBall, {gameId, eventId})
        .pipe(catchError(handleError));
  }

  findByGameId(gameId: number): Observable<{ num: number}[]> {
    return this.http.get<{ num: number}[]>(`${this.urlCalledBall}/game/${gameId}`,)
        .pipe(catchError(handleError));
  }
}
