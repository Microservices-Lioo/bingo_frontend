import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';

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

  joinRoom(room: number): void {
    this.socket.emit('joinGame', room);
    this.listenRoom(`room:${room}`, false);
  }

  joinWaitingRoom(room: number): void {
    this.statusConnection$.next('on-standby');
    this.socket.emit('waitingGame', room);
    this.listenRoom(`room:${room}`, true);
  }

  listenRoom(name: string, isWaiting: boolean) {
    if (isWaiting) {
      // waiting
      this.socket.off(`${name}:waiting`);
      this.socket.on(`${name}:waiting`, (value) => {
        console.log(value);
      });
      
      // count users waiting
      this.socket.off(`${name}:waiting:countUsers`);
      this.socket.on(`${name}:waiting:countUsers`, (value) => {
        this.connectedPlayers$.next(value);
      });
    } else {
      this.socket.off(`${name}`);
      this.socket.on(`${name}`, (value) => {
        console.log(value);
      });    

      // count users
      this.socket.off(`${name}:countUsers`);
      this.socket.on(`${name}:countUsers`, (value: number) => {
        this.connectedPlayers$.next(value);
      });
    }   
  }

  offListenRoom(name: string, eventId: number) {
    // waiting
    this.socket.off(`${name}:waiting`);
    // count users waiting
    this.socket.off(`${name}:waiting:countUsers`);
    this.socket.off(name);
    // count users
    this.socket.off(`${name}:countUsers`);

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
