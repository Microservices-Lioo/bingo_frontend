import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { handleError } from '../../../core/errors';
import { IGame, IGameMode, INumberHistory, IRoom } from '../interfaces';

@Injectable({
    providedIn: 'root'
})
export class GamesService {
    private urlGame = environment.apiUrl + environment.apiMSGameUrl;
    private urlGameMode = environment.apiUrl + environment.apiMSGameModeUrl;

    constructor(
        private http: HttpClient
    ) {}

    //* Obtener todos los modos de juego
    getGameMode(): Observable<IGameMode[]> {
        return this.http.get<IGameMode[]>(`${this.urlGameMode}`)
            .pipe(catchError(handleError));
    }

    //* Obtener la sala del evento
    findRoomByEvent(eventId: string) {
        return this.http.get<IRoom>(`${this.urlGame}/event/${eventId}`)
            .pipe(catchError(handleError));
    }

    //* Obtener el ultimo juego no finalizado de la sala
    findGameToRoom(roomId: string) {
        return this.http.get<IGame | null>(`${this.urlGame}/room/${roomId}`)
            .pipe(catchError(handleError));
    }

    //* Obtener el historial de números cantados
    getNumberHistory(numberHistoryId: string) {
        return this.http.get<INumberHistory>(`${this.urlGame}/numberHistory/${numberHistoryId}`)
            .pipe(catchError(handleError));
    }

    //* Actualizar un juego
    updateGame(id: string, game: Partial<IGame>) {
        return this.http.patch<IGame>(`${this.urlGame}/${id}`, game)
            .pipe(catchError(handleError));
    }
}
