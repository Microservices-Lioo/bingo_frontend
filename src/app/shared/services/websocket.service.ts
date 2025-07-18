import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { StatusEvent, WsEnum } from '../enums';
import { CalledBallI, RoomState, Sing, StatusSing } from '../interfaces';
import { WsConst } from '../consts/ws.const';
import { LoadingService } from './loading.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketServiceShared {
  private socket!: Socket;
  private urlWS = environment.apiUrlWS;
  private statusConnectionBefore: 'connected' | 'on-standby' = 'connected';
  private statusConnection$ = 
    new BehaviorSubject<'connected' | 'disconnected' | 'reconnecting' | 'failed' | 'on-standby'>('disconnected');
  private connectedPlayers$ =
    new BehaviorSubject<number>(0);
  public currentRoom: string | null = null;
  private calledBallSubject$ = new BehaviorSubject<CalledBallI | null>(null);
  private roomStateSubject = new BehaviorSubject<RoomState>({
    isCounterActive: false,
    counter: 0
  });
  private songsSubject = new BehaviorSubject<Sing | null>(null);
  private songsArraySubject = new BehaviorSubject<Sing[] | null>(null);
  private tieBreakerSubject = 
    new BehaviorSubject<{ sing: Sing, order: number, num: number } | null>(null);

  private rewardSubject = new BehaviorSubject<Sing | null>(null);

  public roomState$ = this.roomStateSubject.asObservable();
  public songsState$ = this.songsSubject.asObservable();
  public songsArrayState$ = this.songsArraySubject.asObservable();
  public tieBreaker$ = this.tieBreakerSubject.asObservable();
  public reward$ = this.rewardSubject.asObservable();

  constructor(
    private router: Router,
    private loadingService: LoadingService,
    private toastServ: ToastService
  ) {
  }

  public initWS() {
    const access_token = localStorage.getItem('access_token');
    const reconnectionAttempts = 10;
    this.socket = io(`${this.urlWS}events-games`, {
      reconnection: true,
      reconnectionAttempts,
      reconnectionDelay: 2000,
      timeout: 5000,
      auth: {
        access_token
      },
      transports: ['websocket', 'polling'],
      upgrade: true
    });

    //* Eventos de conexión
    this.socket.on(WsEnum.CONNECT, () => {
      console.log('connected');
      if ( 
        this.statusConnectionBefore === 'on-standby'
      ) {
        this.statusConnection$.next(this.statusConnectionBefore);
      }
      this.statusConnection$.next('connected');
    });

    this.socket.on(WsEnum.DISCONNECT, () => {
      if (
        this.statusConnection$.value === 'connected' || 
        this.statusConnection$.value === 'on-standby'
      ) {
        this.statusConnectionBefore = this.statusConnection$.value;
      }
      this.statusConnection$.next('disconnected');
    });

    //* Eventos de reconexión
    this.socket.io.on(WsEnum.RECONNECT_ATTEMPT, (count) => {
      if (
        this.statusConnection$.value === 'connected' || 
        this.statusConnection$.value === 'on-standby'
      ) {
        this.statusConnectionBefore = this.statusConnection$.value;
      }
      console.log('Intentos de reconexión: ' + count);
      if (reconnectionAttempts === count) {
        this.statusConnection$.next('failed');
      } else {
        console.log('reconecting')
        this.statusConnection$.next('reconnecting');
      }
    });

    this.socket.io.on(WsEnum.RECONNECT, (count) => {
      console.log('Reconexión: ' + count);
    });

    //* Errores
    this.socket.on(WsEnum.CONNECT_ERROR, (error) => {
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
          this.router.navigate(['/home/principal']);
        } else {
          this.statusConnection$.next('failed');
          this.socket.connect();
        }
      }
    });

    this.socket.on(WsEnum.ERROR, (error) => {
      this.toastServ.openToast('ws-error', 'danger', error);
      this.loadingService.clearAllLoading();
    });

    this.socket.on(WsEnum.UNAUTHORIZED, (data) => {
      this.socket.disconnect();
      this.router.navigate(['/home/principal']);
    });

  }

  joinRoom(roomId: number): void {
    this.socket.emit(WsEnum.JOIN_GAME, roomId);
    this.listenRoom(WsConst.keyRoom(roomId));
  }

  joinWaitingRoom(roomId: number): void {
    this.statusConnection$.next('on-standby');
    this.socket.emit(WsEnum.WAITING_GAME, roomId);
    this.listenRoomWaiting(WsConst.keyRoom(roomId), WsConst.keyRoomWaiting(roomId));
  }

  singBingo(roomId: number, cardId: number) {
    this.socket.emit(WsEnum.SING, { roomId, cardId });
  }
  
  verifySing(roomId: number, cardId: number, status: StatusSing, userId: number) {
    this.socket.emit(WsEnum.VERIFY_SING, { roomId, cardId, status, userId});
  }

  deleteSongs(roomId: number) {
    this.socket.emit(WsEnum.DELETE_SONGS, {roomId});
  }

  reward(sing: Sing) {
    this.socket.emit(WsEnum.REWARD_EMIT, {sing});
  }

  tieBreaker(data: { sing: Sing, order: number, num: number }[]) {
    this.socket.emit(WsEnum.TIEBREAKER_EMIT, { data });
  }

  listenRoom(room: string) {
    this.socket.off(room);
    this.socket.on(room, (value) => {
      console.log(value);
    });   

    // count users
    this.socket.off(WsConst.keyRoomCountUsers(room));
    this.socket.on(WsConst.keyRoomCountUsers(room), (value: number) => {
      this.connectedPlayers$.next(value);
    });  

    // called ball
    this.socket.off(WsConst.keyRoomCalledBall(room));
    this.socket.on(WsConst.keyRoomCalledBall(room), (calledBall: CalledBallI) => {
      this.calledBallSubject$.next(calledBall);
    });
    
    // Remaiining Time
    this.socket.off(WsEnum.COUNTER_STARTED);
    this.socket.on(WsEnum.COUNTER_STARTED, (data) => {
      this.updateRoomState({
        isCounterActive: data.isCounterActive,
        counter: data.counter
      });
    });

    // Remaiining Time
    this.socket.off(WsEnum.COUNTER_UPDATE);
    this.socket.on(WsEnum.COUNTER_UPDATE, (data) => {
      this.updateRoomState({
        isCounterActive: data.isCounterActive,
        counter: data.counter
      });
    });
    
    // Remaiining Time
    this.socket.off(WsEnum.COUNTER_FINISHED);
    this.socket.on(WsEnum.COUNTER_FINISHED, (data) => {
      this.updateRoomState({
        isCounterActive: data.isCounterActive,
        counter: data.counter
      });
    });
    
    // Songs
    this.socket.off(WsEnum.SONGS);
    this.socket.on(WsEnum.SONGS, (songs: Sing) => {
      this.songsSubject.next(songs);
    });

    // Songs arrray
    this.socket.off(WsEnum.DELETED_SONGS);
    this.socket.on(WsEnum.DELETED_SONGS, (songs: Sing[]) => {
      this.songsArraySubject.next(songs);
    });

    // tie-breaker
    this.socket.off(WsEnum.TIEBREAKER_LISTEN);
    this.socket.on(WsEnum.TIEBREAKER_LISTEN, 
      (data: { sing: Sing, order: number, num: number }) => {
        this.tieBreakerSubject.next(data);
        // if (typeof data === 'object') {
        //   this.tieBreakerSubject.next(data);
        // } else if (Array.isArray(data)) {
        //   this.tieBreakerSubject.next(data);
        // }
    });
    
    // reward
    this.socket.off(WsEnum.REWARD_LISTEN);
    this.socket.on(WsEnum.REWARD_LISTEN, 
      (data: Sing) => {
        this.rewardSubject.next(data);
    });
  }

  private updateRoomState(newState: RoomState) {
    this.roomStateSubject.next(newState);
  }

  listenRoomWaiting(room: string, roomWaiting: string) {
    // waiting
    this.socket.off(roomWaiting);
    this.socket.on(roomWaiting, (value) => {
      if (value && value === StatusEvent.NOW) {
        this.statusConnection$.next('connected');
        this.statusConnectionBefore = 'connected';
        this.socket.off(roomWaiting);
        this.socket.off(WsConst.keyRoomCountUsers(roomWaiting));
        this.listenRoom(room);
      }
    });
    
    // count users waiting
    this.socket.off(WsConst.keyRoomCountUsers(roomWaiting));
    this.socket.on(WsConst.keyRoomCountUsers(roomWaiting), (value) => {
      this.connectedPlayers$.next(value);
    });  
  }

  offListenRoom(roomId: number) {
    const key = WsConst.keyRoom(roomId);
    const keyWaiting = WsConst.keyRoomWaiting(roomId);

    // waiting
    this.socket.off(keyWaiting);
    this.socket.off(WsConst.keyRoomCountUsers(keyWaiting));

    // original
    this.socket.off(key);
    this.socket.off(WsConst.keyRoomCountUsers(key));
    this.socket.off(WsConst.keyRoomCalledBall(key));
    this.socket.off(WsEnum.COUNTER_STARTED);
    this.socket.off(WsEnum.COUNTER_UPDATE);
    this.socket.off(WsEnum.COUNTER_FINISHED);
    this.socket.off(WsEnum.COUNTER_FINISHED);
    this.socket.off(WsEnum.SONGS);
    this.socket.off(WsEnum.DELETED_SONGS);
    this.socket.off(WsEnum.TIEBREAKER_LISTEN);
    this.socket.off(WsEnum.REWARD_LISTEN);

    this.socket.emit(`disconnectRoom`, roomId);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  getConnectionStatus() {
    return this.statusConnection$.asObservable();
  }

  getConnectedPlayers() {
    return this.connectedPlayers$.asObservable();
  }

  getCalledBallSubject() {
    return this.calledBallSubject$.asObservable();
  }
}
