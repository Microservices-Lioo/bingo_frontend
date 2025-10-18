import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { ESConnectionWs, EWebSocket } from '../enums';
import { IRouletterWinner, ISocket, IStatusCount, IStatusGame, IStatusRoom, ITableWinners } from '../interfaces';
import { WsConst } from '../consts/ws.const';
import { LoadingService } from './loading.service';
import { ToastService } from './toast.service';
import { EAwardsStatus, ERouletteStatus, HostActivity, StatusGame, StatusHostRoom } from '../../features/games/enums';
import { AwardGameInterface, IGame, IRoom } from '../../features/games/interfaces';

@Injectable({
  providedIn: 'root'
})
export class WebsocketServiceShared {
  private socket!: Socket;
  private urlWS = environment.apiUrlWS;

  // socket
  public statusConnection$ = 
    new BehaviorSubject<ESConnectionWs>(ESConnectionWs.DISCONNECTED);
  public connectedPlayers$ = new BehaviorSubject<number>(0);

  // Sala
  public room$ = new BehaviorSubject<IRoom | null>(null);
  public hostActivity$ = new BehaviorSubject<HostActivity>(HostActivity.ESPERANDO);
  public statusHost$ = new BehaviorSubject<StatusHostRoom>(StatusHostRoom.OFFLINE);

  // Juego
  public game$ = new BehaviorSubject<IGame | null>(null);
  public award$ = new BehaviorSubject<AwardGameInterface | null>(null);
  public getCellCard$ = new BehaviorSubject<string | null>(null);
  public myBingo$ = new BehaviorSubject<string>('');
  public tableWinner$ = new BehaviorSubject<{table: ITableWinners[], sing?: ITableWinners} | null>(null);
  public statusCount$ = new BehaviorSubject<IStatusCount | null>(null);
  public winnerModal$ = new BehaviorSubject<boolean>(false);
  public statusGame$ = 
    new BehaviorSubject<StatusGame>(StatusGame.INICIAR);
  public awardStatus$ = 
    new BehaviorSubject<EAwardsStatus | null>(null);
  public rouletteStatus$ = 
    new BehaviorSubject<ERouletteStatus>(ERouletteStatus.NO_INICIADA);
  public rouletteWinner$ = 
    new BehaviorSubject<IRouletterWinner | null>(null);
  
  constructor(
    private router: Router,
    private loadingService: LoadingService,
    private toastServ: ToastService
  ) {
  }

  public initWS(roomId: string) {
    const access_token = localStorage.getItem('access_token');
    const reconnectionAttempts = 10;
    try {
      //* Me conecto al ws
      this.socket = io(`${this.urlWS}room`, {
        reconnection: true,
        reconnectionAttempts,
        reconnectionDelay: 2000,
        timeout: 5000,
        auth: {
          access_token,
          roomId
        },
        transports: ['websocket', 'polling'],
        upgrade: true
      });
      
      //* Eventos de conexión
      this.socket.on(EWebSocket.CONNECT, async () => {
        this.statusConnection$.next(ESConnectionWs.CONNECTED);
        // Para obtener la data de la sala
        await this.listenRoom(roomId);
      });
  
      this.socket.on(EWebSocket.DISCONNECT, () => {
        this.statusConnection$.next(ESConnectionWs.DISCONNECTED);
      });
  
      //* Eventos de reconexión
      this.socket.io.on(EWebSocket.RECONNECT_ATTEMPT, (count) => {
        console.log('Intentos de reconexión: ' + count);
        if (reconnectionAttempts === count) {
          this.statusConnection$.next(ESConnectionWs.FAILED);
        } else {
          this.statusConnection$.next(ESConnectionWs.RECONNECTING);
        }
      });
  
      this.socket.io.on(EWebSocket.RECONNECT, (count) => {
        console.log('Reconexión: ' + count);
      });
  
      //* Errores
      this.socket.on(EWebSocket.CONNECT_ERROR, (error) => {
        if (this.socket.active) {
          console.log('Error de reconección: ' + error.message);
        } else {
          console.log('Conexión fue denegada: ' + error.message);
          if (
            error.message === 'Token requerido' ||
            error.message === 'Token expirado' ||
            error.message === 'Token inválido' ||
            error.message === 'Error de autenticación'
          ) {
            this.router.navigate(['/']);
          } else {
            this.statusConnection$.next(ESConnectionWs.FAILED);
            this.socket.connect();
          }
        }
      });
  
      this.socket.on(EWebSocket.ERROR, (error) => {
        this.toastServ.openToast('ws-error', 'danger', error);
        this.loadingService.clearAllLoading();
      });
  
      this.socket.on(EWebSocket.UNAUTHORIZED, (data) => {
        this.socket.disconnect();
        this.router.navigate(['/']);
      });
    } catch (error) {
      console.error(error);
    }
  }

  //* Emitir
  countUsersToRoom() {
    this.socket.emit(EWebSocket.COUNT);
  }

  async listenRoom(roomId: string) {
    // Estado del socket
    this.socket.off(WsConst.socket(roomId));
    this.socket.on(WsConst.socket(roomId), (value: ISocket) => {
      if ('numUsers' in value) { // numero de usuarios conectados
        this.connectedPlayers$.next(value.numUsers!);
      }
    });

    // Room
    this.socket.off(WsConst.room(roomId));
    this.socket.on(WsConst.room(roomId), (value: IStatusRoom) => {
      if ('room' in value) { // datos de la sala
        this.room$.next(value.room!);
      }
      if ('hostActivity' in value) { // Actividad del host
        this.hostActivity$.next(value.hostActivity!);
      }
      if ('status' in value) { // esatdo de la conectividad del host
        this.statusHost$.next(value.status!);
      }
    });

    // Game
    this.socket.off(WsConst.game(roomId));
    this.socket.on(WsConst.game(roomId), (value: IStatusGame) => {
      if ('game' in value) { // datos del juego
        this.game$.next(value.game!);
      }
      if ('award' in value) { // datos de los premios del juego
        this.award$.next(value.award!);
      }
      if ('cell' in value) { // numero cantado
        this.getCellCard$.next(value.cell!);
      }
      if ('myBingo' in value) { // resouesta del canto del jugador
        this.myBingo$.next(value.myBingo!);
      }
      if ('counter' in value) { // Estado del conteo regresivo
        this.statusCount$.next(value.counter!);
      }
      if ('tableWinner' in value) { // Tabla de ganadores
        this.tableWinner$.next(value.tableWinner!);
      }
      if ('winnerModal' in value) { // Estado del modal true or false
        this.winnerModal$.next(value.winnerModal!);
      }
      if ('awardStatus' in value) { // Estado de la premiación
        this.awardStatus$.next(value.statusAward!);
      }
      if ('rouletteStatus' in value) { // Estado de la ruleta de premiación
        this.rouletteStatus$.next(value.rouletteStatus!);
      }
      if ('rouletteWinner' in value) { // posicion del ganador en la ruleta
        this.rouletteWinner$.next(value.rouletteWinner!);
      }
      if ('statusGame' in value) { // Estado del juego
        this.statusGame$.next(value.statusGame!);
      }
      
    });

    await this.emitRoom();
  }

  async emitRoom() {
    this.countUsersToRoom();
  }

  async offListenRoom(roomId: string) {
    this.socket.off(WsConst.room(roomId));
    this.socket.off(WsConst.game(roomId));
    this.socket.off(WsConst.socket(roomId));
  }

  //* Me desconecto del ws
  async disconnect(roomId: string) {
    if (this.socket) {
      await this.offListenRoom(roomId)
      this.socket.disconnect();
    }
  }

  // Iniciar o crear un juego
  createGame(awardId: string, modeId: string) {
    this.socket.emit(EWebSocket.CREATE_GAME, {awardId, modeId});
  }

  //* Solicitar una celda random sin repetir las anteriores
  cellCard(gameId: string) {
    this.socket.emit(EWebSocket.CELL_CARD, {gameId});
  }

  //* Cantar bingo
  singBingo(cardId: string, numberHistoryId: string, modeId: string) {
    this.socket.emit(EWebSocket.BINGO, { cardId, numberHistoryId, modeId });
  }

  //* Actualizar un canto de bingo APROBADO O RECHAZADO
  updateBingo(cardId: string, status: string) {
    this.socket.emit(EWebSocket.UPDATE_BINGO, { cardId, status });
  }

  //* Actualizar el estado del modal de premiación
  winnerModal(status: boolean) {
    this.socket.emit(EWebSocket.UPDATE_STATUS_WINNER_MODAL, { status });
  }

  //* Actualizar de la actividad del host
  updateHostActivity(status: HostActivity) {
    this.socket.emit(EWebSocket.HOST_ACTIVITY, { status });
  }

  //* Actualizar el estado de la premiación
  updateAwardStatus(status: EAwardsStatus) {
    this.socket.emit(EWebSocket.AWARD_STATUS, { status });
  }

  //* Actualizar el estado de la ruleta de premiación
  updateRouletteStatus(status: ERouletteStatus) {
    this.socket.emit(EWebSocket.ROULETTE_STATUS, { status });
  }

  //* Actualizar la posicion del ganador en la ruleta
  updateRouletteWinner(data: IRouletterWinner) {
    this.socket.emit(EWebSocket.ROULETTE_WINNER, data);
  }

  //* Limpiar tabla de cantos de jugadores
  cleanTableSongs() {
    this.socket.emit(EWebSocket.CLEAN_TABLE_SONGS);
  }
}
