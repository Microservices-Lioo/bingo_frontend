import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { handleError } from '../../../core/errors';
import { GameMode } from '../interfaces';
import { AwardSharedInterface } from '../../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class GamesService {
    private url = environment.apiUrl + environment.apiMSGameModeUrl;

    private _calledBall = new Subject<number>();
    private _cleanBoardBalls = new Subject<boolean>();

    calledball$ = this._calledBall.asObservable();
    cleanBoardBalls$ = this._cleanBoardBalls.asObservable();
    constructor(
        private http: HttpClient
    ) {}

    sendBall(num: number) {
        this._calledBall.next(num);
    }

    cleanBalls(val: boolean) {
        this._cleanBoardBalls.next(val);
    }

    getGameMode(): Observable<GameMode[]> {
        return this.http.get<GameMode[]>(`${this.url}`)
            .pipe(catchError(handleError));
    }

}
