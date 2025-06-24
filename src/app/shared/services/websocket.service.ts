import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { StatusEvent } from '../enums';

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
  joinKeyRoom = 'room';

  constructor(
    private router: Router,
  ) {
    this.initWS(); 
  }

  private initWS() {
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
    this.socket.on("connect", () => {
      console.log('connected');
      if ( 
        this.statusConnectionBefore === 'on-standby'
      ) {
        this.statusConnection$.next(this.statusConnectionBefore);
      }
    });

    this.socket.on("disconnect", () => {
      if (
        this.statusConnection$.value === 'connected' || 
        this.statusConnection$.value === 'on-standby'
      ) {
        this.statusConnectionBefore = this.statusConnection$.value;
      }
      this.statusConnection$.next('disconnected');
    });

    //* Eventos de reconexión
    this.socket.io.on("reconnect_attempt", (count) => {
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
        this.statusConnection$.next('reconnecting');
      }
    });

    this.socket.io.on("reconnect", (count) => {
      console.log('Reconexión: ' + count);
    });

    //* Errores
    this.socket.on('connect_error', (error) => {
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

    this.socket.on('unauthorized', (data) => {
      this.socket.disconnect();
      this.router.navigate(['/home/principal']);
    });

  }

  joinRoom(roomId: number): void {
    this.socket.emit('joinGame', roomId);
    this.listenRoom(`${this.joinKeyRoom}:${roomId}`);
  }

  joinWaitingRoom(roomId: number): void {
    this.statusConnection$.next('on-standby');
    this.socket.emit('waitingGame', roomId);
    this.listenRoomWaiting(`${this.joinKeyRoom}:${roomId}`);
  }

  listenRoom(room: string) {
    this.socket.off(room);
    this.socket.on(room, (value) => {
      console.log(value);
    });    

    // count users
    this.socket.off(`${room}:countUsers`);
    this.socket.on(`${room}:countUsers`, (value: number) => {
      this.connectedPlayers$.next(value);
    });  
  }

  listenRoomWaiting(room: string) {
    // waiting
    this.socket.off(`${room}:waiting`);
    this.socket.on(`${room}:waiting`, (value) => {
      if (value && value === StatusEvent.NOW) {
        this.statusConnection$.next('connected');
        this.statusConnectionBefore = 'connected';
        this.socket.off(`${room}:waiting`);
        this.socket.off(`${room}:waiting:countUsers`);
        this.listenRoom(room);
      }
    });
    
    // count users waiting
    this.socket.off(`${room}:waiting:countUsers`);
    this.socket.on(`${room}:waiting:countUsers`, (value) => {
      this.connectedPlayers$.next(value);
    });  
  }

  offListenRoom(room: string, eventId: number) {
    // waiting
    this.socket.off(`${room}:waiting`);
    // count users waiting
    this.socket.off(`${room}:waiting:countUsers`);
    this.socket.off(room);
    // count users
    this.socket.off(`${room}:countUsers`);

    this.socket.emit(`disconnectRoom`, eventId);
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

}
