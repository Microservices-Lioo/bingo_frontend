import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { EWebSocket } from '../enums';
import { ITableWinners } from '../interfaces';
import { WsConst } from '../consts/ws.const';
import { LoadingService } from './loading.service';
import { ToastService } from './toast.service';
import { HostActivity, StatusGame, StatusHostRoom, StatusRoom } from '../../features/games/enums';
import { IGame } from '../../features/games/interfaces';

interface IStatusCount {
  endTime: number;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketServiceShared {
  private socket!: Socket;
  private urlWS = environment.apiUrlWS;
  private statusConnection$ = 
    new BehaviorSubject<'connected' | 'disconnected' | 'reconnecting' | 'failed'>('disconnected');
  private connectedPlayers$ =
    new BehaviorSubject<number>(0);

  public hostActivity$ = new BehaviorSubject<HostActivity>(HostActivity.ESPERANDO);
  public statusHost$ = new BehaviorSubject<StatusHostRoom>(StatusHostRoom.OFFLINE);
  public statusRoom$ = new BehaviorSubject<StatusRoom>(StatusRoom.NOT_STARTED);
  public game$ = new BehaviorSubject<IGame | null>(null);
  public getCellCard$ = new BehaviorSubject<string | null>(null);
  public statusCount$ = new BehaviorSubject<IStatusCount | null>(null);
  public tableWinner$ = new BehaviorSubject<{table: ITableWinners[], sing?: ITableWinners} | null>(null);
  public myBingo$ = new BehaviorSubject<string>('');
  public winnerModal$ = new BehaviorSubject<{isOpen: boolean} | null>(null);
  public statusRaffle$ = 
    new BehaviorSubject<StatusGame>(StatusGame.INICIAR);
  
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
        this.statusConnection$.next('connected');
        // Para obtener la data de la sala
        await this.listenRoom(roomId);
      });
  
      this.socket.on(EWebSocket.DISCONNECT, () => {
        this.statusConnection$.next('disconnected');
      });
  
      //* Eventos de reconexión
      this.socket.io.on(EWebSocket.RECONNECT_ATTEMPT, (count) => {
        console.log('Intentos de reconexión: ' + count);
        if (reconnectionAttempts === count) {
          this.statusConnection$.next('failed');
        } else {
          console.log('reconecting')
          this.statusConnection$.next('reconnecting');
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
            this.statusConnection$.next('failed');
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


  countUsersToRoom() {
    this.socket.emit(EWebSocket.COUNT);
  }

  async listenRoom(roomId: string) {
    // cantidad de usuarios de la sala
    this.socket.off(WsConst.countUser(roomId));
    this.socket.on(WsConst.countUser(roomId), (value: number) => {
      this.connectedPlayers$.next(value);
    });

    // actualización de estado del host de la sala
    this.socket.off(WsConst.statusHostRoom(roomId));
    this.socket.on(WsConst.statusHostRoom(roomId), (value: StatusHostRoom) => {
      this.statusHost$.next(value);
    });
    
    // actualización de estado de la sala
    this.socket.off(WsConst.statusRoom(roomId));
    this.socket.on(WsConst.statusRoom(roomId), (value: StatusRoom) => {
      console.log(value)
      this.statusRoom$.next(value);
    });
    
    // actualización de estado del juego de la sala
    this.socket.off(WsConst.statusGame(roomId));
    this.socket.on(WsConst.statusGame(roomId), (value) => {
      this.statusRaffle$.next(value);
    });

    // actualización la data del juego de la sala
    this.socket.off(WsConst.game(roomId));
    this.socket.on(WsConst.game(roomId), (value: IGame) => {
      this.game$.next(value);
    });
    
    // Escuchar los cantos numericos desde el servidor
    this.socket.off(WsConst.getCellCard(roomId));
    this.socket.on(WsConst.getCellCard(roomId), (value: string) => {
      this.getCellCard$.next(value);
    });
    
    // Escuchar el estado del tiempo regresivo activado en el servidor
    this.socket.off(WsConst.count(roomId));
    this.socket.on(WsConst.count(roomId), (value: IStatusCount | null) => {
      this.statusCount$.next(value);
    });

    // Escuchar el estado de la solicitud de bingo
    this.socket.off(WsConst.myBingo(roomId));
    this.socket.on(WsConst.myBingo(roomId), (value) => {
      this.myBingo$.next(value)
    });

    // Escuchar el estado de la tabla de ganadores
    this.socket.off(WsConst.tableWinners(roomId));
    this.socket.on(WsConst.tableWinners(roomId), (value: {table: ITableWinners[], sing?: ITableWinners}) => {
      this.tableWinner$.next(value);
    });

    // Escuchar el estado del modal de ganadores
    this.socket.off(WsConst.winnerModal(roomId));
    this.socket.on(WsConst.winnerModal(roomId), (value: {isOpen: boolean}) => {
      this.winnerModal$.next(value);
    });

    // Escuchar la actividad del host al cantar un número
    this.socket.off(WsConst.activityHost(roomId));
    this.socket.on(WsConst.activityHost(roomId), (value: HostActivity) => {
      this.hostActivity$.next(value);
    });

    await this.emitRoom();
  }

  async emitRoom() {
    this.countUsersToRoom();
  }

  async offListenRoom(roomId: string) {
    // cantidad de usuarios de la sala
    this.socket.off(WsConst.countUser(roomId));

    // actualización de estado del host de la sala
    this.socket.off(WsConst.statusHostRoom(roomId));
    
    // actualización de estado de la sala
    this.socket.off(WsConst.statusRoom(roomId));
    
    // actualización de estado del juego de la sala
    this.socket.off(WsConst.statusGame(roomId));

    // actualización la data del juego de la sala
    this.socket.off(WsConst.game(roomId));

    // Escuchar los cantos numericos desde el servidor
    this.socket.off(WsConst.getCellCard(roomId));
    
    // Escuchar el estado del tiempo regresivo activado en el servidor
    this.socket.off(WsConst.count(roomId));

    // Escuchar el estado de la solicitud de bingo
    this.socket.off(WsConst.myBingo(roomId));

    // Escuchar el estado de la tabla de ganadores
    this.socket.off(WsConst.tableWinners(roomId));

    // Escuchar el estado del modal de ganadores
    this.socket.off(WsConst.winnerModal(roomId));

    // Escuchar la actividad del host al cantar un número
    this.socket.off(WsConst.activityHost(roomId));
  }

  //* Me desconecto del ws
  async disconnect(roomId: string) {
    if (this.socket) {
      await this.offListenRoom(roomId)
      this.socket.disconnect();
    }
  }

  //* crear un juego
  createGame(awardId: string, modeId: string) {
    this.socket.emit(EWebSocket.CREATE_GAME, {awardId, modeId});
  }

  //* Obtener el estado del usuario en la sala
  getConnectionStatus() {
    return this.statusConnection$.asObservable();
  }

  //* Solicitar una celda random sin repetir las anteriores
  cellCard(gameId: string) {
    this.socket.emit(EWebSocket.CELL_CARD, {gameId});
  }

  //* Obtener el número de jugadores en la sala
  getConnectedPlayers() {
    return this.connectedPlayers$.asObservable();
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

  //* Actualizar el estado del juego
  statusGame(status: string) {
    this.socket.emit(EWebSocket.STATUS_GAME, { status });
  }

  //* Actualizar de la actividad del host
  updateHostActivity(status: HostActivity) {
    this.socket.emit(EWebSocket.HOST_ACTIVITY, { status });
  }
}
