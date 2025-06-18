import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventServiceShared, ModalService, WebsocketServiceShared } from '../../../shared/services';
import { EventAwardsInterface } from '../../../core/interfaces';
import { BallStatusComponent } from './ball-status/ball-status.component';
import { initFlowbite, ModalInterface } from 'flowbite';
import { GamesService } from '../services/games.service';
import { CardPagination, CardTypeShared } from '../../../shared/interfaces/card-shared.interface';
import { CardTest } from '../data-test/card-test';
import { GameMode } from '../interfaces';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon'; 
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { AwardSharedInterface } from '../../../shared/interfaces';
import { AwardServiceShared } from '../../../shared/services/award.service';
import { StatusConnectionComponent } from '../../../shared/components/status-connection/status-connection.component';

type AwardType = {
  num: number;
  name: string;
  winner: string;
  winner_status: boolean;
  status: boolean;
};

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
export class PrincipalComponent implements OnInit {
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
  awardsList: AwardType[];
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
  initTimeGameGlobal: string = 'HH:MM:SS';

  // Iniciar modo de juego
  gameModeSelected: boolean = false;
  awardGameModeSelected: boolean  = false;
  gameModeList: GameMode[] = [];
  awardList: AwardSharedInterface[] = [];
  statusConnection: 'connected' | 'disconnected' | 'reconnecting' | 'failed' = 'disconnected';
  titleMsgConnection: string = '';
  textMsgConnection: string = '';

  constructor(
    private route: ActivatedRoute,
    private eventSharedServ: EventServiceShared,
    private awardSheredServ: AwardServiceShared,
    private gameServ: GamesService,
    private cardTest: CardTest,
    private modalSev: ModalService,
    private _formBuilder: FormBuilder,
    private socketServ: WebsocketServiceShared
  ) {
    // TODO: TEST
    this.awardsList = this.getAwardsList();
    this.cardsList = this.getCardsList();
    
    this.IsAdmin = true;
  }
  
  ngOnInit() {
    const eventId = this.route.snapshot.paramMap.get('id');
    const userId = this.route.snapshot.paramMap.get('userId');
    this.getEvent(+eventId!, +userId!);
    
    this.calledBall(5);
    this.cleanBalls(true);
    initFlowbite();
    
    this.isAdmin(+eventId!);
    this.getGameMode();
    this.getAwards();
    
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
    this.socketServ.joinRoom(parseInt(eventId!));

    this.socketServ.getConnectionStatus().subscribe({
      next: (status) => {
        if (status === 'disconnected') {
          this.titleMsgConnection = 'Has sido desconectado';
          this.textMsgConnection = 'No tienes acceso a esta sala';
        } else if (status === 'reconnecting') {
          this.titleMsgConnection = 'Intento de reconexión';
          this.textMsgConnection = 'Espera un momento mientras te incorporamos a la sala...';
        } else if (status === 'failed') {
          this.titleMsgConnection = 'Error de conexión';
          this.textMsgConnection = 'No se pudo conectar. Por favor, recarga la página o intenta más tarde.';
        }
        this.statusConnection =  status;
      }
    })
  }

  isAdmin(eventId: number) {
    this.eventSharedServ.getUserRoleEvent(eventId).subscribe({
      next: (result) => {
        this.IsAdmin = result;
      },
      error: (error) => {
        console.log('error new: ' + error)
      }
    });
  }
  
  getAwardsList(): AwardType[] {
    let awards = [
      { num: 1, name: 'Premio 1', winner: 'Kevin', winner_status: true, status: false },
      { num: 2, name: 'Premio 2', winner: '', winner_status: false, status: true },
      { num: 3, name: 'Premio 3', winner: '', winner_status: false, status: false },
      { num: 4, name: 'Premio 4', winner: '', winner_status: false, status: false },
      { num: 5, name: 'Premio 5', winner: '', winner_status: false, status: false},
      { num: 6, name: 'Premio 6', winner: '', winner_status: false, status: false },
    ];
    
    return this.orderAwards(awards);
  }
  
  getCardsList(): CardPagination {
    return { data: this.cardTest.generateBingoCards(5), meta: { lastPage: 5, page: 1, total: 5 } };
  }
  
  orderAwards(awards: AwardType[]) {    
    let auxActualxList: AwardType;
    let auxFinList: AwardType[] = [];
    let auxProxList: AwardType[] = [];
    
    awards.forEach(element => {
      if (element.status) {
        auxActualxList = element;
      } else if (element.winner_status) {
        auxFinList.push(element);
      } else {
        auxProxList.push(element);
      }
    });
    let awardsResult = [auxActualxList!, ...auxProxList.concat(...auxFinList)];
    return awardsResult;
  }
  
  getEvent(eventId: number, userId: number) {
    this.eventSharedServ.getEventWithAwards(+eventId, userId).subscribe({
      next: (event) => {
        this.eventData = event;
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

  getAwards() {
    const eventId = this.route.snapshot.paramMap.get('id');
    this.awardSheredServ.getAwards(+eventId!).subscribe({
      next: (awards) => {
        this.awardList = awards;
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
  
  startGame() {
    this.modalStartGameMode();
    this.initGame = true;
    this.startTimeGameGlobal();
  }

  startTimeGameGlobal() {
    if (this.initGame) {
      this.initDateGameGlobal = new Date().getTime().toString();
      this.initTimeGameGlobal = '00:00:00';      
    }
  }

  modalStartGameMode() {
    const modal = this.modalSev.createModal('modal-start-game-mode');
    this.modalGameMode = modal;
    this.modalSev.openModal(modal);
  }
}
