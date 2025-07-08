import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CardsServiceShared,
  EventServiceShared,
  GamesSharedService,
  LoadingService,
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
  CalledBallI,
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
import { AwardSharedInterface, CardSharedI, EventUpdateSharedInterface, GameModeSharedI, GameRuleSharedI, Sing } from '../../../shared/interfaces';
import { StatusConnectionComponent } from '../../../shared/components/status-connection/status-connection.component';
import { AuthService } from '../../auth/services';
import { StatusEvent } from '../../../shared/enums';
import { initTabs } from 'flowbite';
import { CalledBallsService } from '../services/called-balls.service';
import { Subscription } from 'rxjs';

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
    StatusConnectionComponent,
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
  numberRandom: number = 0;
  nameCol: string = '';
  statusGameRaffle: 'INICIAR' | 'INICIADO' | 'CONCLUIDO' | 'ERROR' = 'INICIAR';
  isAnimating = false;

  // Iniciar sala
  initEvent = false;
  initGame = false;
  initDateGameGlobal: string = '';
  connectedPlayers: number = 0;
  textMsgForm = "";

  // Iniciar modo de juego
  gameModeSelected: boolean = false;
  gameRuleSelected: boolean = false;
  awardGameModeSelected: boolean = false;
  statusConnection: 'connected' | 'disconnected' | 'reconnecting' | 'failed' | 'on-standby' = 'disconnected';
  titleMsgConnection: string = '';
  textMsgConnection: string = '';

  // data
  gameModeList: GameModeI[] = [];
  gameMode: GameModeI | null = null;
  gameRule: GameRuleI | null = null;
  game: GameI | null = null;
  calledBallList: { num: number}[] = [];
  roomState: any = {
    isCounterActive: false,
    counter: 0,
  };

  songsList: Sing[] = [];

  // estados
  cardPosition: number = 0;
  modoActive: 'manual' | 'automatico' = 'manual';

  // estados de carga
  isStartingCounter: boolean = false;
  isStoppingCounter: boolean = false;

  loadingStates = {
    accion1: false,
    accion2: false,
    accion3: false
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authServ: AuthService,
    private gameServ: GamesService,
    private calledBallServ: CalledBallsService,
    private modalSev: ModalService,
    private _formBuilder: FormBuilder,
    private toastServ: ToastService,
    private eventSharedServ: EventServiceShared,
    private socketServ: WebsocketServiceShared,
    private gameSharedServ: GamesSharedService,
    private cardsServiceShared: CardsServiceShared,
    private loadingServ: LoadingService
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

    //* Web Socket
    this.subscriptions.push(
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
          this.statusConnection = status;
        }
      })
    );

    this.subscriptions.push(
      this.socketServ.getConnectedPlayers().subscribe({
        next: (players) => {
          this.connectedPlayers = players;
        },
        error: (error) => {
          console.log(error);
        }
      })
    );

    this.subscriptions.push(
      this.socketServ.getCalledBallSubject().subscribe({
        next: (calledBall) => {
          if (calledBall) {
            this.lastCalledBall(calledBall.num, calledBall.colName);
            this.calledBall(calledBall.num);
          }
        },
        error: (error) => {
          console.log(error);
        }
      })
    );

    this.subscriptions.push(
      this.socketServ.roomState$.subscribe(state => {
        this.roomState = state;
        this.loadingServ.setLoadingStates('btnNumberRandom', state.isCounterActive);
      })
    );

    this.subscriptions.push(
      this.socketServ.songsState$.subscribe(sing => {
        if (sing) {
          this.songsList.push(sing);
        }
      })
    );
  }

  ngAfterViewInit() {
    initFlowbite();
    initTabs();
  }

  ngOnDestroy() {
    if (this.eventData) {
      this.socketServ.offListenRoom(this.eventData.id);
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());
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
        let isAdmin = false;
        if (currentUserId === userId && event.userId === userId) {
          isAdmin = true;
          this.IsAdmin = isAdmin;
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
      next: async (data) => {
        if (data) {
          this.initGame = true;
          const { game, gameMode, gameOnMode, gameRule } = data;
          this.game = game;
          this.initData(gameMode, gameRule);
          await this.getCalledBallsByGameId(game.id);
        } else {
          this.initGame = false;
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

  async lastCalledBall(num: number, col: string) {
    this.gameServ.sendLastCalledBall(num, col);
    if (this.modoActive === 'automatico') {
      this.updateCardCell(num);
    }
  }

  private updateCardCell(num: number) {
    if (this.cardsList) {
      this.cardsList.forEach(card => {
        const found = card.nums.some(row => row.some((cell) => {
          if (cell.number === num) {
            cell.marked = true;
            this.cellSelected(card.id, { marked: true, number: num }, true);
            return true;
          }
          return false;
        })
        );
      });
    }
  }

  calledBall(ball: number) {
    this.gameServ.sendBall(ball);
  }

  cleanBalls(val: boolean) {
    this.gameServ.cleanBalls(val);
  }

  async cellSelected(cardId: number, cel: { marked: boolean, number: number }, market?: boolean) {
    const { number} = cel;

    if (number === 0) return;
    
    this.cardsServiceShared.checkOrUncheckBoxCard(cardId, number, market).subscribe({
      next: (cel) => {
        if (cel && this.cardsList) {
          const card = this.cardsList.find(card => card.id == cardId);
          if (card) {
            const found = card.nums.some(row =>
              row.some(cell => {
                if (cell.number === number) {
                  cell.marked = cel.marked;
                  return true;
                }
                return false;
              })
            );              
          }
        }
      },
      error: (error) => {
        console.timeLog(error);
      }
    });
  }

  async btnCellSelected(cardId: number, cel: { marked: boolean, number: number }) {
    this.modoActive = 'manual';
    await this.cellSelected(cardId, cel);
  }

  btnNextCard() {
    if (this.cardsList) {
      const page = this.cardsList.length;
      if (this.cardPosition != page) {
        this.cardPosition = this.cardPosition + 1;
      }
    }
  }

  btnPrevCard() {
    if (this.cardsList) {
      if (this.cardPosition != 0) {
        this.cardPosition = this.cardPosition - 1;
      }
    }
  }

  btnNumberRandom() {
    if (this.loadingServ.isLoading('btnNumberRandom')) {
      this.toastServ.openToast('conteo', 'warning', 'Debes esperar a que se agote el tiempo de espera');
      return;
    }
    if (this.game && this.eventData) {
      this.loadingServ.setLoadingStates('btnNumberRandom', true);
      const { id: gameId } = this.game;
      const { id: eventId } = this.eventData;

      let maxCount = 75;
      const intervalTime = 100;
      this.isAnimating = false;
      const colNames = ['B', 'I', 'N', 'G', 'O'];

      const interval = setInterval(async () => {
        this.nameCol = colNames[Math.floor(Math.random() * colNames.length)];
        this.numberRandom = Math.floor(Math.random() * maxCount) + 1;

        setTimeout(() => this.isAnimating = true, 0);

      }, intervalTime);

      this.calledBallServ.unrepeatableTableNumberRaffle(gameId, eventId).subscribe({
        next: (calledBall) => {
          this.isAnimating = false;
          clearInterval(interval);

          if (!calledBall) {
            this.statusGameRaffle = 'CONCLUIDO';
          } else {
            this.statusGameRaffle = 'INICIADO';

            this.numberRandom = calledBall.num;
            this.nameCol = calledBall.colName;
            this.lastCalledBall(calledBall.num, calledBall.colName);
          }
        },
        error: (error) => {
          this.statusGameRaffle = 'ERROR';
          console.log(error);
        }
      });
    } else {
      this.statusGameRaffle = 'INICIAR';
    }
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

  async getCalledBallsByGameId(gameId: number) {
      this.calledBallServ.findByGameId(gameId).subscribe({
        next: async (calledBall) => {
          if (calledBall.length == 0) {
            if (this.IsAdmin) {
              this.statusGameRaffle = 'INICIADO';
            }
          } else {
            if (calledBall.length >= 75) {
              this.initGame = false;
              if (this.IsAdmin) {
                this.statusGameRaffle = 'CONCLUIDO';
              } else {
                //TODO: LIMPIAR BOLAS CANTADAS
                //TODO: LIMPIAR TABLAS
              }
            } else {
              const arrayCalledNums = calledBall.map(({num}) => num);
              const calledEndNum = arrayCalledNums[arrayCalledNums.length - 1];
              const nameCol = await this.columnIdentification(calledEndNum);

              if (this.IsAdmin) {
                this.statusGameRaffle = 'INICIADO';
                this.numberRandom = calledEndNum;
                this.nameCol = nameCol;
              } else {
                
                
              }
              this.calledBallList = calledBall;
              this.lastCalledBall(calledEndNum, nameCol);
              calledBall.forEach(({num}) => {
                this.calledBall(num);
                if (!this.IsAdmin) {
                  this.updateCardCell(num);
                }
              });

              //TODO: LLENAR LAS TABLAS
            }

          }
        },
        error: (error) => {
          if (this.IsAdmin) {
            this.statusGameRaffle = 'ERROR';
          }
          console.log(error);
        }
      });
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

  private async columnIdentification(num: number): Promise<string> {
    if (num > 0 && num <= 15 ) {
      return `B`;
    } else if (num >= 16 && num <= 30) {
      return `I`;
    } else if (num >= 31 && num <= 45) {
      return `N`;
    } else if (num >= 46 && num <= 60) {
      return `G`;
    } else if (num >= 61 && num <= 75) {
      return `O`;
    } else {
      return '';
    }
  }

  modoSelect(modo: 'manual' | 'automatico') {
    this.modoActive = modo;
  }

  singBingo() {
    //* validar antes de enviar;
    if (this.cardsList) {
      this.cardsList?.forEach(card => {
        for (let row = 0; row < card.nums.length; row++) {
          for (let col = 0; col < card.nums[row].length; col++) {
            if (this.gameRule?.rule.includes(`${row}:${col}`) && !card.nums[row][col].marked){
              this.toastServ.openToast('sing', 'danger', 'Tus aciertos no coinciden con las reglas');
              return;
            }
          }
        }
      })
    }
    
    //* enviar para verificar
    if (this.eventData) { 
      this.toastServ.openToast('sing', 'success', 'Has cantado BINGO!!!, espera mientras el administrador valida tu tabla');
      this.socketServ.singBingo(this.eventData.id);
    }
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
