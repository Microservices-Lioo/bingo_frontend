import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  CardsServiceShared,
  EventServiceShared, 
  GamesSharedService, 
  ModalService, 
  ToastService, 
  WebsocketServiceShared 
} from '../../../shared/services';
import { EventAwardsInterface } from '../../../core/interfaces';
import { BallStatusComponent } from './ball-status/ball-status.component';
import { initFlowbite, ModalInterface } from 'flowbite';
import { GamesService } from '../services/games.service';
import { 
  AwardGameInterface, 
  GameI, 
  GameModeI, 
  GameOnModeI, 
  GameRuleI,
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
import { AwardSharedInterface, CardSharedI, EventUpdateSharedInterface, GameModeSharedI, GameRuleSharedI } from '../../../shared/interfaces';
import { StatusConnectionComponent } from '../../../shared/components/status-connection/status-connection.component';
import { AuthService } from '../../auth/services';
import { StatusEvent } from '../../../shared/enums';
import { initTabs } from 'flowbite';

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
export class PrincipalComponent implements OnInit, AfterViewInit, OnDestroy {
  loadingBtnAnimated = false;
  eventData!: EventAwardsInterface;
  matrixMode: boolean[][] = [];
  numCalled: number | null = null;
  awardsList!: AwardGameInterface[];
  cardsList: CardSharedI[] | null = null;
  modalGameMode: ModalInterface | null = null;
  
  // Formul
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;

  IsAdmin: boolean = false;
  
  // Buton de sorteo de numero random
  numberRandom: number | string = 'INICIAR';
  isAnimating = false;
  arrNumbers: number[] = [];
  
  // Iniciar sala
  initEvent = false;
  initGame = false;
  initDateGameGlobal: string = '';
  connectedPlayers: number = 0;
  textMsgForm = "";

  // Iniciar modo de juego
  gameModeSelected: boolean = false;
  gameRuleSelected: boolean = false;
  awardGameModeSelected: boolean  = false;
  statusConnection: 'connected' | 'disconnected' | 'reconnecting' | 'failed' | 'on-standby' = 'disconnected';
  titleMsgConnection: string = '';
  textMsgConnection: string = '';

  // data
  gameModeList: GameModeI[] = [];
  gameMode: GameModeI | null = null;
  gameRule: GameRuleI | null = null;

  // estados
  cardPosition: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventSharedServ: EventServiceShared,
    private gameServ: GamesService,
    private modalSev: ModalService,
    private _formBuilder: FormBuilder,
    private socketServ: WebsocketServiceShared,
    private authServ: AuthService,
    private gameSharedServ: GamesSharedService,
    private toastServ: ToastService,
    private cardsServiceShared: CardsServiceShared
  ) { 
    this.firstFormGroup = this._formBuilder.group({
      awardCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      modeCtrl: ['', Validators.required]
    });
  }
  
  async ngOnInit() {
    const eventId = this.route.snapshot.paramMap.get('id');
    const userId = this.route.snapshot.paramMap.get('userId');
    if (!eventId && !userId) {
      this.router.navigate(['/home']);
      return;
    }

    this.socketServ.initWS();

    await this.getEvent(+eventId!, +userId!);
    await this.getDataGame(+eventId!);

    this.calledBall(5);
    this.cleanBalls(true);
    
    //* Web Socket
    this.socketServ.getConnectionStatus().subscribe({
      next: (status) => {
        console.log('status: ' + status)
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

  ngAfterViewInit() {
    initFlowbite();
    initTabs();
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
  
  async getCardsList(eventId: number) {
    this.cardsServiceShared.findToEventByBuyer(eventId)
      .subscribe({
        next: (card) => {
          if (card.length === 0) {
            this.router.navigate(['home']);
          } else {
            this.cardsList = card;
          }
        },
        error: (error) => {
          this.toastServ.openToast('card', 'danger', 'No perteneces a este evento');
          this.router.navigate(['home']);
        }
      });
  }
  
  async getEvent(eventId: number, userId: number) {
    this.eventSharedServ.getEventWithAwards(+eventId, userId).subscribe({
      next: async (event) => {
        const currentUserId = this.authServ.currentUser.id;
        if (currentUserId === userId && event.userId === userId) {
          this.IsAdmin = true;
        } else {
          await this.getCardsList(eventId);    
        }
        if ((currentUserId === userId && event.userId === userId) || 
          event.status == 'NOW') {
          this.socketServ.joinRoom(event.id);
          this.initEvent = true;
          this.getGameMode();
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

  async getDataGame(eventId: number) {
    this.gameSharedServ.getDataGame(eventId).subscribe({
      next: (data) => {
        if (data) {
          this.initGame = true;
          const { game, gameMode, gameOnMode, gameRule } = data;
          this.initData(gameMode, gameRule);

        } else {
          this.initGame = false;
          console.log('game no existe');
        }
      },
      error(err) {
        console.log(err);
      },
    })
  }

  private initData(gameMode: GameModeSharedI, gameRule: GameRuleSharedI) {
    this.initGame = true;
    this.gameModeSelected = true;
    this.gameRuleSelected = true;
    this.awardGameModeSelected = true;
    this.gameMode = gameMode;
    this.gameRule = gameRule;

    for (let i = 0; i < 5; ++i) {
      const row: boolean[] = [];
      for (let j = 0; j < 5; ++j) {
        const key = `${i}:${j}`;
        row.push(gameRule.rule.includes(key));
      }
      this.matrixMode.push(row);
    }
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
    if ( this.cardsList ) {
      const page = this.cardsList.length;
      if (this.cardPosition != page) {
        this.cardPosition = this.cardPosition + 1;
      }
    }
  }
  
  btnPrevCard() {
    if ( this.cardsList ) {
      if (this.cardPosition != 0) {
        this.cardPosition = this.cardPosition - 1;
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
    
    this.toastServ.openToast('game', 'success', 'Evento iniciado');
  }

  async startGame() {
    this.clearForm();
    this.modalStartGameMode();
  }

  createGame() {
    if (!this.initGame) {
      if (this.firstFormGroup.valid && this.secondFormGroup.valid) {
        this.textMsgForm = "";
        if (!this.eventData) {
          return;
        }
        const { id: eventId } = this.eventData;
        const awardId = this.firstFormGroup.value.awardCtrl;
        const modeId = this.secondFormGroup.value.modeCtrl;
        this.gameServ.createGameWithMode(eventId, awardId, modeId).subscribe({
          next: (value) => {
            if (value) {
              const { game, gameMode, gameOnMode, gameRule } = value;

              this.initGame = true;
              this.initData(gameMode, gameRule);
            }
            this.toastServ.openToast('game', 'success', 'Juego iniciado');
            this.closeModal();
          },
          error: (err) => {
            console.log(err);
            this.closeModal();
          },
        })
        
      } else {
        this.textMsgForm = "El formulario no es válido";
      }
    }
  }

  closeModal() {
    if (this.modalGameMode) {
      this.textMsgForm = "";
      this.modalSev.closeModal(this.modalGameMode);
      this.clearForm();
    }
  }

  modalStartGameMode() {
    const modal = this.modalSev.createModal('modal-start-game-mode');
    this.textMsgForm = "";
    this.modalGameMode = modal;
    this.modalSev.openModal(modal);
  }

  tabModeSelected(tab: string) {
    const divModo = document.getElementById('modo');
    const divReglas = document.getElementById('reglas');
    if (tab === 'modo') {
      if (divModo && divReglas) {
        divModo.className = 'block';
        divReglas.className = 'hidden';
      }
    } else {
      if (divModo && divReglas) {
        divReglas.className = 'block';
        divModo.className = 'hidden';
      }
    }
  }

  clearForm() {
    this.firstFormGroup.reset();
    this.secondFormGroup.reset();
  }

  //* Event
  async updateStatusEvent(eventId: number, data: EventUpdateSharedInterface) {
    this.eventSharedServ.updateStatusEvent(eventId, data)
      .subscribe({
        complete: () => console.log('Evento actualizado'),
        error: (error) => {
          this.toastServ.openToast('event', 'danger', error.message);
        }
      });
  }
}
