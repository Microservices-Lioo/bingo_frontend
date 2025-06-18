import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from '../../features/auth/services';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketServiceShared {
  private socket!: Socket;
  private urlWS = environment.apiUrlWS;
  private statusConnection$ = new BehaviorSubject<'connected' | 'disconnected' | 'reconnecting' | 'failed'>('disconnected');

  constructor(
    private authServ: AuthService,
    private router: Router
  ) { this.initWS(); }

  private initWS() {
    const access_token = localStorage.getItem('access_token');

    this.socket = io(`${this.urlWS}events-games`, {
      reconnection: true,
      reconnectionAttempts: 10,
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
      this.statusConnection$.next('connected');
    });

    this.socket.on("disconnect", () => {
      this.statusConnection$.next('disconnected');
    });

    //* Eventos de reconexión
    this.socket.io.on("reconnect_attempt", (count) => {
      this.statusConnection$.next('reconnecting');
      console.log('Intentos de reconexión: ' + count);
    });

    this.socket.io.on("reconnect", (count) => {
      this.statusConnection$.next('connected');
      console.log('Reconexión: ' + count);
    });

    //* Errores
    this.socket.on('connect_error', (error) => {
      if (this.socket.active) {
        this.statusConnection$.next('failed');
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
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  public getConnectionStatus() {
    return this.statusConnection$.asObservable();
  }

}
