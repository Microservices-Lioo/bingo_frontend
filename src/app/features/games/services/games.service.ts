import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { handleError } from '../../../core/errors';
import { GameModeI } from '../interfaces';
import { DataGameSharedI } from '../../../shared/interfaces';

@Injectable({
    providedIn: 'root'
})
export class GamesService {
    private urlGame = environment.apiUrl + environment.apiMSGameUrl;
    private urlGameMode = environment.apiUrl + environment.apiMSGameModeUrl;

    private _lastCalledBall = new Subject<{num: number, col: string}>();
    private _calledBall = new Subject<number>();
    private _cleanBoardBalls = new Subject<boolean>();

    lastCalledBall$ = this._lastCalledBall.asObservable();
    calledball$ = this._calledBall.asObservable();
    cleanBoardBalls$ = this._cleanBoardBalls.asObservable();

    constructor(
        private http: HttpClient
    ) {}

    sendLastCalledBall(num: number, col: string) {
        this._lastCalledBall.next({num, col});
    }

    sendBall(num: number) {
        this._calledBall.next(num);
    }

    cleanBalls(val: boolean) {
        this._cleanBoardBalls.next(val);
    }

    getGameMode(): Observable<GameModeI[]> {
        return this.http.get<GameModeI[]>(`${this.urlGameMode}`)
            .pipe(catchError(handleError));
    }

    createGameWithMode(eventId: string, awardId: string, gameModeId: string): Observable<DataGameSharedI> {
        return this.http.post<DataGameSharedI>(`${this.urlGame}/with/mode`, { eventId, awardId, gameModeId })
            .pipe(catchError(handleError));
    }

}
