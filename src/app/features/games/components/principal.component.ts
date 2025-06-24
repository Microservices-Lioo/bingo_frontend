import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { 
  EventServiceShared, 
  ModalService, 
  WebsocketServiceShared 
} from '../../../shared/services';
import { EventAwardsInterface } from '../../../core/interfaces';
import { BallStatusComponent } from './ball-status/ball-status.component';
import { initFlowbite, ModalInterface } from 'flowbite';
import { GamesService } from '../services/games.service';
import { CardPagination } from '../../../shared/interfaces/card-shared.interface';
import { CardTest } from '../data-test/card-test';
import { 
  AwardGameInterface, 
  GameMode, 
  StatusAward
} from '../interfaces';
import { 
  FormBuilder, 
  FormGroup, 
  ReactiveFormsModule, 
  Validators 
} from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon'; 
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { AwardSharedInterface, EventUpdateSharedInterface } from '../../../shared/interfaces';
import { StatusConnectionComponent } from '../../../shared/components/status-connection/status-connection.component';
import { AuthService } from '../../auth/services';
import { StatusEvent } from '../../../shared/enums';

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [
    BallStatusComponent,
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatRadioModule,
    StatusConnectionComponent
  ],
  templateUrl: './principal.component.html',
  styles: `
  .cell {
    margin: 0px;
    font-size: 7px; 
  }
  .slide-up {
    animations: slideUp 0.2s ease-in-out;
  }

  @keyframes slideUp {
    0% {
      opacity: 0;
      transform: translateY(20%);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  `
})
export class PrincipalComponent implements OnInit, OnDestroy {
  loadingBtnAnimated = false;
  eventData!: EventAwardsInterface;
  matrixMode: boolean[][] = [
    [true, false, false, false, true],
    [true, true, false, false, true],
    [true, false, true, false, true],
    [true, false, false, true, true],
    [true, false, false, false, true],
  ];
  numCalled: number | null = null;
  awardsList!: AwardGameInterface[];
  cardsList: CardPagination;
  modalGameMode: ModalInterface | null = null;
  
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  
  IsAdmin: boolean = false;
  
  // Buton de sorteo de numero random
  numberRandom: number | string = 'INICIAR';
  isAnimating = false;
  arrNumbers: number[] = [];
  
  // Iniciar sala
  initGame = false;
  initDateGameGlobal: string = '';
  connectedPlayers: number = 0;

  // Iniciar modo de juego
  gameModeSelected: boolean = false;
  awardGameModeSelected: boolean  = false;
  gameModeList: GameMode[] = [];
  statusConnection: 'connected' | 'disconnected' | 'reconnecting' | 'failed' | 'on-standby' = 'disconnected';
  titleMsgConnection: string = '';
  textMsgConnection: string = '';

  constructor(
    private route: ActivatedRoute,
    private eventSharedServ: EventServiceShared,
    private gameServ: GamesService,
    private cardTest: CardTest,
    private modalSev: ModalService,
    private _formBuilder: FormBuilder,
    private socketServ: WebsocketServiceShared,
    private authServ: AuthService
  ) {
    this.cardsList = this.getCardsList();    
  }
  
  async ngOnInit() {
    const eventId = this.route.snapshot.paramMap.get('id');
    const userId = this.route.snapshot.paramMap.get('userId');
    
    await this.getEvent(+eventId!, +userId!);
    
    this.calledBall(5);
    this.cleanBalls(true);
    initFlowbite();
    
    this.getGameMode();
    
    this.firstFormGroup = this._formBuilder.group({
      awardCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      modeCtrl: ['', Validators.required]
    });

    // TODO: TEST
    let page = this.cardsList.meta.page;
    let lastPage = this.cardsList.meta.lastPage;
    let paginationElem = document.getElementById('pagination-card');
    if (paginationElem) {
      paginationElem.innerHTML = `T${page} de T${lastPage}`;
    }

    //* Web Socket
    this.socketServ.getConnectionStatus().subscribe({
      next: (status) => {
        if (status === 'connected') {
          this.titleMsgConnection = 'Conectado';
          this.textMsgConnection = 'Estas conectado a la sala';
          this.getEvent(+eventId!, +userId!);
        } else if (status === 'disconnected') {
          this.titleMsgConnection = 'Has sido desconectado';
          this.textMsgConnection = 'No tienes acceso a esta sala';
        } else if (status === 'reconnecting') {
          this.titleMsgConnection = 'Intento de reconexión';
          this.textMsgConnection = 'Espera un momento mientras te incorporamos a la sala...';
        } else if (status === 'failed') {
          this.titleMsgConnection = 'Error de conexión';
          this.textMsgConnection = 'No se pudo conectar. Por favor, recarga la página o intenta más tarde.';
        } else if (status === 'on-standby') {
          this.titleMsgConnection = 'Sala de espera';
          this.textMsgConnection = 'Sala no iniciada. Por favor, espera a que el anfitrión inicie la sala.';
        }
        this.statusConnection =  status;
      }
    });

    this.socketServ.getConnectedPlayers().subscribe({
      next: (players) => {
        this.connectedPlayers = players;
      }
    });
  }

  ngOnDestroy() {
    if (this.eventData) {
      this.socketServ.offListenRoom(`room:${this.eventData.id}`, this.eventData.id);
    }
  }
  
  async getAwardsList(awards: AwardSharedInterface[]) {
    let awardsList = awards.map(award => ({
      ...award,
      status: StatusAward.PROX
    }));
    
    this.awardsList = awardsList;
  }
  
  getCardsList(): CardPagination {
    return { data: this.cardTest.generateBingoCards(5), meta: { lastPage: 5, page: 1, total: 5 } };
  }
  
  async getEvent(eventId: number, userId: number) {
    this.eventSharedServ.getEventWithAwards(+eventId, userId).subscribe({
      next: async (event) => {
        const currentUserId = this.authServ.currentUser.id;
        if (currentUserId === userId && event.userId === userId) {
          this.IsAdmin = true;
        }
        if ((currentUserId === userId && event.userId === userId) || 
          event.status == 'NOW') {
          this.socketServ.joinRoom(event.id);
        } else if (event.status == 'TODAY') {
          this.socketServ.joinWaitingRoom(event.id);
        }
        this.eventData = event;

        await this.getAwardsList(event.award as AwardSharedInterface[]);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  getGameMode() {
    this.gameServ.getGameMode().subscribe({
      next: (gamesMode) => {
        this.gameModeList = gamesMode;
      },
      error: (error) => {
        console.log(error);
      }
    })
  }
  
  calledBall(ball: number) {
    this.gameServ.sendBall(ball);
  }
  
  cleanBalls(val: boolean) {
    this.gameServ.cleanBalls(val);
  }
  
  btnCellSelected(col: number, row: number) {
    console.log(col, row);
  }
  
  btnNextCard() {
    let page = this.cardsList.meta.page;
    let lastPage = this.cardsList.meta.lastPage;
    let paginationElem = document.getElementById('pagination-card');
    
    if ( page < lastPage ) {
      page++;
      this.cardsList.meta.page = page;
      if (paginationElem) {
        paginationElem.innerHTML = `T${page} de T${lastPage}`;
      }
    }
  }
  
  btnPrevCard() {
    let page = this.cardsList.meta.page;
    let lastPage = this.cardsList.meta.lastPage;
    let paginationElem = document.getElementById('pagination-card');
    
    if ( page > 1 ) {
      page--;
      this.cardsList.meta.page = page;
      if (paginationElem) {
        paginationElem.innerHTML = `T${page} de T${lastPage}`;
      }
    }
  }
  
  btnNumberRandom() {
    const maxCount = 10;
    
    if ( !this.arrNumbers || this.arrNumbers.length === 0) {
      this.arrNumbers = Array.from({ length: maxCount }, (_, i) => i + 1);
      this.arrNumbers.sort(() => Math.random() > 0.5 ? 1 : -1);
    }
    
    if (this.arrNumbers.length === 0) {
      this.numberRandom = 'Concluido';
      return;
    }
    
    let count = 0;
    const animationCount= 20;
    const intervalTime = 50;
    
    const interval = setInterval(() => {
      this.numberRandom = Math.floor(Math.random() * maxCount) + 1;
      
      this.isAnimating = false;
      setTimeout(() => this.isAnimating = true, 0);
      
      count++;
      if (count >= animationCount) {
        clearInterval(interval);
        const nextNumber = this.arrNumbers.shift();
        if (nextNumber && nextNumber <= 15 ) {
          this.numberRandom  = nextNumber ? `B-${nextNumber}` : 'Conluido';
        } else if (nextNumber && (nextNumber >= 16 && nextNumber <= 30) ) {
          this.numberRandom  = nextNumber ? `I-${nextNumber}` : 'Conluido';
        } else if (nextNumber && (nextNumber >= 31 && nextNumber <= 45) ) {
          this.numberRandom  = nextNumber ? `N-${nextNumber}` : 'Conluido';
        } else if (nextNumber && (nextNumber >= 46 && nextNumber <= 60) ) {
          this.numberRandom  = nextNumber ? `G-${nextNumber}` : 'Conluido';
        } else if (nextNumber && (nextNumber >= 61 && nextNumber <= 75) ) {
          this.numberRandom  = nextNumber ? `O-${nextNumber}` : 'Conluido';
        } else {
          this.numberRandom  = 'Conluido';
        }
      }
    }, intervalTime);
  }
  
  async startEvent() {
    if (!this.eventData) {
      return;
    }
    const { id: eventId } = this.eventData;

    const updateData: EventUpdateSharedInterface = { status: StatusEvent.NOW };
    
    await this.updateStatusEvent(eventId, updateData);
    // this.modalStartGameMode();
    // this.initGame = true;
    // this.startTimeGameGlobal();
  }

  startTimeGameGlobal() {
    if (this.initGame) {
      this.initDateGameGlobal = new Date().getTime().toString();    
    }
  }

  modalStartGameMode() {
    const modal = this.modalSev.createModal('modal-start-game-mode');
    this.modalGameMode = modal;
    this.modalSev.openModal(modal);
  }

  //* Event
  async updateStatusEvent(eventId: number, data: EventUpdateSharedInterface) {
    this.eventSharedServ.updateStatusEvent(eventId, data)
      .subscribe({
        complete: () => console.log('Evento actualizado'),
        error: (error) => {
          console.log(error.message);
        }
      });
  }
}
