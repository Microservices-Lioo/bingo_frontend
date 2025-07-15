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
import { AwardSharedInterface, CardNumsSharedI, CardSharedI, EventUpdateSharedInterface, GameModeSharedI, GameRuleSharedI, Sing, StatusSing } from '../../../shared/interfaces';
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
  //* EVERYONE
  loadingBtnAnimated = false;
  eventData!: EventAwardsInterface;
  matrixMode: boolean[][] = [];
  numCalled: number | null = null;
  awardsList!: AwardGameInterface[];
  modalGameMode: ModalInterface | null = null;
  modalSongs: ModalInterface | null = null;
  // FORMULARIO PARA SELECCIONAR EL PREMIO Y EL MODO DE JUEGO
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;

  IsAdmin: boolean = false;
  public StatusSing = StatusSing;
  // Iniciar sala
  initEvent = false;
  initGame = false;
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
  calledBallList: number[] = [];
  roomState: any = {
    isCounterActive: false,
    counter: 0,
  };

  songsList: Sing[] = [];

  modoActive: 'manual' | 'automatico' = 'manual';

  //* FOR ADMIN
  // Buton de sorteo de numero random
  numberRandom: number = 0;
  nameCol: string = '';
  statusGameRaffle: 'INICIAR' | 'INICIADO' | 'CONCLUIDO' | 'ERROR' = 'INICIAR';
  isAnimating = false;

  // cantos
  numsSongsByUser: CardNumsSharedI[] = [];
  selectedSing: Sing | null = null;

  //* FOR USER
  cardsList: CardSharedI[] | null = null;
  cardPosition: number = 0;
  
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
    const id = this.route.snapshot.paramMap.get('id');
    const buyer = this.route.snapshot.paramMap.get('userId');
    if (!id || !buyer) {
      this.router.navigate(['/home']);
      return;
    }

    const eventId = parseInt(id);
    const userId = parseInt(buyer);

    this.socketServ.initWS();

    await this.getEventWithAwards(eventId!, userId!);
    await this.getDataGame(eventId!);

    //* Web Socket
    this.subscriptions.push(
      this.socketServ.getConnectionStatus().subscribe({
        next: (status) => {
          if (status === 'connected') {
            this.titleMsgConnection = 'Conectado';
            this.textMsgConnection = 'Estas conectado a la sala';
            // this.getEvent(+eventId!, +userId!);
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

        // admin automático
        if (!state.isCounterActive && this.IsAdmin && this.modoActive == 'automatico') {
          this.btnNumberRandom();
        }
      })
    );

    this.subscriptions.push(
      this.socketServ.songsState$.subscribe(sing => {
        if (sing) {
          const positionSing = this.songsList.findIndex(s => s.cardId == sing.cardId && s.eventId == sing.eventId && s.userId == sing.userId);
          if (positionSing < 0) {
            this.songsList.push(sing);
          } else {
            this.updateSingPostion(positionSing, sing);
          }
        }
      })
    );

    this.subscriptions.push(
      this.socketServ.songsArrayState$.subscribe((sing) => {
        if (sing) {
          this.songsList = [...sing];
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

  //* EVERYONE
  /**
   * Tranforma la lista de awards agregando un nuevo atributo
   * Agrega status con valor definido 
   * @param awards[]
   */
  async transformAwardList(awards: AwardSharedInterface[]) {
    let awardsList = awards.map(award => ({
      ...award,
      status: StatusAward.PROX
    }));

    this.awardsList = awardsList;
  }

  /**
   * Método para obtener datos del evento (event) y sus premios (awards) asociados
   * @param eventId type number
   * @param userId type number
   */
  async getEventWithAwards(eventId: number, userId: number) {
    this.eventSharedServ.getEventWithAwards(eventId, userId).subscribe({
      next: async (event) => {

        if (!event) {
          this.toastServ.openToast('get-event-awards', 'danger', 'Evento no existe');
          return;
        }

        const currentUserId = this.authServ.currentUser.id;
        const owner = event.userId;
        const isAdmin = await this.isAdminUser(currentUserId, owner);

        if (!isAdmin) {
          await this.getCardsList(eventId);
        }

        this.IsAdmin = isAdmin;

        if (isAdmin || event.status == 'NOW') {
          this.socketServ.joinRoom(eventId);
          this.initEvent = true;
          this.getGameModeToForm();
        } else if (event.status == 'TODAY') {
          this.socketServ.joinWaitingRoom(eventId);
        }

        this.eventData = event;

        await this.transformAwardList(event.award as AwardSharedInterface[]);
      },
      error: (error) => {
        this.toastServ.openToast('get-event-awards', 'danger', error.message);
      }
    });
  }

  /**
   * Método para verificar si el usuario actual es dueño(owner) o juagdor
   * @param currentUserId type number
   * @param owner type number
   * @returns boolean - True si es owner o False is player
   */
  async isAdminUser(currentUserId: number, owner: number) {
    if (currentUserId === owner) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Método para obtener todos los datos relacionados con el juego
   * Obtengo game, gameMode, gameOnMode, gameRule
   * @param eventId type number
   */
  async getDataGame(eventId: number) {
    this.gameSharedServ.getDataGame(eventId).subscribe({
      next: async (data) => {
        if (!data) {
          this.toastServ.openToast('data-game', 'danger', 'Datos del juego no obtenidos');
          this.initGame = false;
          return;
        }

        this.initGame = true;
        const { game, gameMode, gameOnMode, gameRule } = data;
        this.game = game;
        this.initDataGame(gameMode, gameRule);
        await this.getCalledBallsByGameId(game.id);
      },
      error: (error) => {
        this.toastServ.openToast('data-game', 'danger', error.message);
      }
    })
  }

  /**
   * Método para inicializar banderas de validación 
   * y completar matriz de modo de juego para visualizarla
   * @param gameMode type GameModeSharedI
   * @param gameRule type GameRuleSharedI
   */
  private initDataGame(gameMode: GameModeSharedI, gameRule: GameRuleSharedI) {
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

  /**
   * Método para enviar el último número llamado o cantado
   * @param num type number
   * @param col type string
   */
  async lastCalledBall(num: number, col: string) {
    this.gameServ.sendLastCalledBall(num, col);
    if (this.modoActive === 'automatico' && !this.IsAdmin) {
      this.updateCardCell(num);
    }
  }
  
  /**
   * Método para enviar el número cantado
   * @param ball type number
   */
  calledBall(ball: number) {
    this.gameServ.sendBall(ball);
  }

  /**
   * Método para eliminar el número cantado
   * @param ball type number
   */
  cleanBalls(val: boolean) {
    this.gameServ.cleanBalls(val);
  }

  /**
   * Método para ordenar un array numerico de manera ascendente
   * @param array type number
   * @returns number[]
   */
  sortAscendantForNumber(array: number[]) {
    return array.sort((a, b) => a - b);
  }

  /**
   * Método para ordenar un array de objectos de manera ascendente
   * @param array type number
   * @returns number[]
   */
  sortAscendantForObject(array: CardNumsSharedI[][]) {
    const arrayFlat = array.flat();
    return arrayFlat.sort((a, b) => a.number - b.number);
  }

  /**
   * Método para cambiar de vista en la seccion de reglas y modo de juego
   * @param tab 
   */
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

  /**
   * Método para limpiar los datos del formulario cargados en los inputs
   */
  clearForm() {
    this.firstFormGroup.reset();
    this.secondFormGroup.reset();
  }

  /**
   * Método para verificar que columna le pertenece al número cantado
   * @param num type number
   * @returns Promise<string>
   */
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

  /**
   * Método para cambiar de modo para un juego manual o automático
   * @param modo string
   */
  modoSelect(modo: 'manual' | 'automatico') {
    this.modoActive = modo;
    if (this.IsAdmin && modo == 'automatico') {
      if (!this.loadingServ.isLoading('btnNumberRandom')) {
        this.btnNumberRandom();
      }
    }
  }

  /**
   * Método para actualizar los cantos
   * @param index type number
   * @param sing type Sing
   */
  updateSingPostion(index: number, sing: Sing) {
    this.songsList[index] = sing;
  }

  /**
   * Método para obtener el id del usuario autenticado
   * @returns id type number
   */
  getCurrentUserId() {
      return this.authServ.currentUser.id;
  }

  /**
   * Método para concluir el juego
   */
  endGame() {
    //* Limpiar los numeros cantados
    //* Limpiar el ultimo numero cantado
    //* Limpiar modo de juego y reglas seleccionadas
    this.initGame = false;

    // Admin

    // User
    //* Limpiar todas las tablas
    this.cardPosition = 0;
  }

  //* FOR ADMIN
  /**
   * Método para obtener todos los modos de juego que existen
   */
  getGameModeToForm() {
    this.gameServ.getGameMode().subscribe({
      next: (gamesMode) => {
        if (!gamesMode || gamesMode.length < 0) {
          this.toastServ.openToast('game-mode-form', 'danger', 'No existen modos de juego');
          return;
        }

        this.gameModeList = gamesMode;
      },
      error: (error) => {
        this.toastServ.openToast('game-mode-form', 'danger', error.message);
      }
    });
  }

  /**
   * Método para cantar un número no cantado durante el juego
   * @returns 
   */
  btnNumberRandom() {
    if (this.songsList.length > 0) {
      this.toastServ.openToast('number-random', 'warning', 'Tienes cantos pendientes');
      this.modoActive = 'manual';
      return;
    }

    if (this.loadingServ.isLoading('btnNumberRandom')) {
      this.toastServ.openToast('number-random', 'warning', 'Debes esperar a que se agote el tiempo de espera');
      return;
    }

    if (!this.game || !this.eventData) {
      this.toastServ.openToast('number-random', 'warning', 'El juego o el evento no estan inicializados');
      this.statusGameRaffle = 'INICIAR';
      return;
    }

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
          console.log('no hay numero llamado: ' + calledBall)
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
        this.toastServ.openToast('number-random', 'danger', error.message);
      }
    });
  }

  /**
   * Método para iniciar el evento
   */
  async startEvent() {
    if (!this.eventData) {
      this.toastServ.openToast('start-event', 'danger', 'El evento no existe');
      return;
    }

    const { id: eventId } = this.eventData;

    const updateData: EventUpdateSharedInterface = { status: StatusEvent.NOW };

    await this.updateStatusEvent(eventId, updateData);

    this.toastServ.openToast('game', 'success', 'Evento iniciado');
  }

  /**
   * Método para iniciar un juego
   */
  async startGame() {
    this.clearForm();
    this.modalStartGameMode();
  }

    /**
   * Método para crean un juego
   */
  createGame() {
    if (!this.initGame) {
      if (this.firstFormGroup.valid && this.secondFormGroup.valid) {
        this.textMsgForm = "";
        if (!this.eventData) {
          this.toastServ.openToast('create-modal', 'danger', 'El evento no está inicializado');
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
              this.initDataGame(gameMode, gameRule);
            }
            this.toastServ.openToast('game', 'success', 'Juego iniciado');
            this.closeModal();
          },
          error: (error) => {
            this.toastServ.openToast('create-game', 'danger', error.message);
            this.closeModal();
          },
        });
      } else {
        this.textMsgForm = "El formulario no es válido";
      }
    }
  }

  /**
   * Método para cerrar el modal para crear un juego
   */
  closeModal() {
    if (this.modalGameMode) {
      this.textMsgForm = "";
      this.modalSev.closeModal(this.modalGameMode);
      this.clearForm();
    }
  }

  /**
   * Método para abrir el modal para crear un juego
   */
  modalStartGameMode() {
    const modal = this.modalSev.createModal('modal-start-game-mode');
    this.textMsgForm = "";
    this.modalGameMode = modal;
    this.modalSev.openModal(modal);
  }

    /**
   * Método para abrir el modal de revision de cantos por los usuaros juagdores
   * @param cardId type number
   * @param buyer type number
   */
  async openModalSong(sing: Sing) {
    if (!this.eventData) return this.toastServ.openToast('open-modal', 'danger', 'Evento no inicializado');

    const {cardId, userId: buyer} = sing;

    const modal = this.modalSev.createModal('modal-songs');
    this.modalSongs = modal;

    this.cardsServiceShared.getCardByIdBuyerEvent(this.eventData.id, cardId, buyer)
      .subscribe({
        next: (nums) => {
          if (!nums) {
            this.toastServ.openToast('song', 'danger', 'No se obtuvo los números cantados por el juagador');
            return;
          }
          this.numsSongsByUser = this.sortAscendantForObject(nums);
          this.modalSev.openModal(modal);
        },
        error: (error) => {
          this.toastServ.openToast('song', 'danger', error.message);
        }
      });
    this.selectedSing = sing;
  }

  /**
   * Método para cerrar el modal de cantos
   */
  closeModalSongs() {
    if(this.modalSongs) {
      this.modalSev.closeModal(this.modalSongs);
    }
  }

  /**
   * Método para actualizar el estado delñ evento
   * @param eventId type number
   * @param data type EventUpdateSharedInterface
   */
  async updateStatusEvent(eventId: number, data: EventUpdateSharedInterface) {
    this.eventSharedServ.updateStatusEvent(eventId, data)
      .subscribe({
        complete: () => console.log('Evento actualizado'),
        error: (error) => {
          this.toastServ.openToast('event', 'danger', error.message);
        }
      });
  }

  /**
   * Método para verificar el canto y actualizarlo en el servidor
   * @param status 
   * @returns 
   */
  songVerifyByAdmin(status: StatusSing, sing?: Sing) {
    if (!this.eventData) return this.toastServ.openToast('song-verify', 'danger', 'El evento no está inicializado');
    if (!this.selectedSing && !sing) return this.toastServ.openToast('song-verify', 'danger', 'No se ha seleccionado el canto');

    const { id: roomId } = this.eventData;
    const { cardId, userId } = (this.selectedSing || sing) as Sing;
    this.socketServ.verifySing(roomId, cardId, status, userId);
    this.closeModalSongs();
    this.selectedSing = null;
  }

  /**
   * Método para limpiar la tabala de cantos
   */
  deleteAllSongs() {
    if (!this.eventData) return this.toastServ.openToast('song-verify', 'danger', 'El evento no está inicializado');
    const { id: roomId } = this.eventData;
    this.socketServ.deleteSongs(roomId);
  }

  //* FOR USER
  /**
   * Método para obtener las tablas de bingo(cards) del usuario jugador
   * Almacena las cards dentro de cardsList
   * @param eventId type number
   */
  async getCardsList(eventId: number) {
    this.cardsServiceShared.findToEventByBuyer(eventId)
      .subscribe({
        next: (cards) => {
          if (cards.length === 0) {
            this.toastServ.openToast('card', 'danger', 'No tienes tablas para este evento');
            this.router.navigate(['home']);
          } else {
            this.cardsList = cards;
          }
        },
        error: (error) => {
          this.toastServ.openToast('card', 'danger', error.message);
          this.router.navigate(['home']);
        }
      });
  }

  /**
   * Método para completar automáticamente la tabla de bingo
   * y seleccionar el número llamado
   * @param num type number
   */
  private updateCardCell(num: number) {
    if (!this.cardsList || this.cardsList.length < 0) {
      this.toastServ.openToast('update-card-cell', 'danger', 'No existe una card a tu nombre');
      return;
    }

    this.cardsList.forEach(card => {
      card.nums.some(row => 
        row.some((cell) => {
          if (cell.number === num) {
            cell.marked = true;
            this.cellSelected(card.id, { marked: true, number: num }, true);
            return true;
          }
          return false;
        }),
      );
    });
  }

  /**
   * Método para actualizar la celda seleccionada por el usuario en su tabla
   * @param cardId type number
   * @param cel type object
   * @param market type boolean 
   */
  async cellSelected(cardId: number, cel: { marked: boolean, number: number }, market?: boolean) {
    const { number} = cel;

    if (number === 0) return;
    
    this.cardsServiceShared.checkOrUncheckBoxCard(cardId, number, market).subscribe({
      next: (cel) => {
        if (!cel || !this.cardsList || this.cardsList.length < 0) {
          this.toastServ.openToast('cell-selected', 'danger', 'No se obtuvo la celda o las tablas no han sido inicializadas');
          return;
        }

        const position = this.cardsList.findIndex(card => card.id == cardId);
        const card =  this.cardsList[position];

        if (card) {
          this.cardPosition = position;
          const isMarked = card.nums.some(row =>
            row.some(cell => {
              if (cell.number === number) {
                cell.marked = cel.marked;
                return true;
              }
              return false;
            })
          );
          if (isMarked && this.modoActive == 'automatico') {
            this.singBingoAuto(position);         
          }
        }
      },
      error: (error) => {
        this.toastServ.openToast('cell-selected', 'danger', error.message);
      }
    });
  }

  /**
   * Meptodo para seleccionar una celada manualmente al dar click
   * @param cardId type number
   * @param cel type object
   */
  async btnCellSelected(cardId: number, cel: { marked: boolean, number: number }) {
    this.modoActive = 'manual';
    await this.cellSelected(cardId, cel);
  }

  /**
   * Método para cambiar la posicion de la tabla de bingo (card) presentada a la siguiente.
   */
  btnNextCard() {
    if (!this.cardsList || this.cardsList.length < 0 || this.cardPosition < 0) {
      this.toastServ.openToast('next-card', 'danger', 'Tablas no inicializadas o la posicion no existe');
      return;
    }
    const page = this.cardsList.length;
    if (this.cardPosition != page) {
      this.cardPosition = this.cardPosition + 1;
    }
  }

  /**
   * Método para cambiar la posicion de la tabla de bingo (card) presentada a la anterior.
   */
  btnPrevCard() {
    if (!this.cardsList || this.cardsList.length < 0 || this.cardPosition < 0) {
      this.toastServ.openToast('next-card', 'danger', 'Tablas no inicializadas o la posicion no existe');
      return;
    }
    if (this.cardPosition != 0) {
      this.cardPosition = this.cardPosition - 1;
    }
  }

  /**
   * Método para obtener los numeros llamdos en un juego por su identificador
   * @param gameId type number
   */
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
              this.calledBallList = this.sortAscendantForNumber([...calledBall.map(num => num.num)]);
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
          this.toastServ.openToast('called-balls', 'danger', error.message);
        }
      });
  }

  /**
   * Método para cantar bingo, emitido al administrador del juego para posteriormente ser verificado
   * @returns 
   */
  async singBingo() {
    if (this.cardPosition < 0) return this.toastServ.openToast('sing', 'danger', 'No hay card seleccionada');
    if (!this.eventData) return this.toastServ.openToast('sing', 'danger', 'Evento no inicializado');
    if (!this.cardsList) return this.toastServ.openToast('sing', 'danger', 'No existe una card asociada a tu usuario');
    if (!this.gameRule) return this.toastServ.openToast('sing', 'danger', 'Reglas no seleccionadas por el administrador');

    //* validar antes de enviar;
    //* validar que la logitud de los numeros seleccionados en la card sean iguales o mayores a las reglas
    const countRulePosition = this.gameRule.rule.length;
    const countMarked = this.cardsList[this.cardPosition].nums.flat().filter(cell => cell.marked).length;
    if (countMarked < countRulePosition) {
      this.toastServ.openToast('sing', 'danger', 'Aun no completas las reglas del modo de juego');
      return;
    }

    //* validar que los números de la card esten seleccionados segun la posicion de la regla
    const card = this.cardsList[this.cardPosition];
    for (let row = 0; row < card.nums.length; row++) {
      for (let col = 0; col < card.nums[row].length; col++) {
        if (this.gameRule.rule.includes(`${row}:${col}`) && !card.nums[row][col].marked){
          this.toastServ.openToast('sing', 'danger', 'Tus aciertos no coinciden con las reglas');
          return;
        }
      }
    }
    
    //* enviar para verificar
    this.toastServ.openToast('sing', 'success', 'Has cantado BINGO!!!, espera mientras el administrador valida tu tabla');
    this.socketServ.singBingo(this.eventData.id, this.cardsList[this.cardPosition].id);
  }

  /**
   * Método para cantar bingo automaticamente, emitido al administrador del juego para posteriormente ser verificado
   * @returns 
   */
  async singBingoAuto(postion: number) {
    if (!this.eventData) return this.toastServ.openToast('sing', 'danger', 'Evento no inicializado');
    if (!this.cardsList) return this.toastServ.openToast('sing', 'danger', 'No existe una card asociada a tu usuario');
    if (!this.gameRule) return this.toastServ.openToast('sing', 'danger', 'Reglas no seleccionadas por el administrador');

    //* validar antes de enviar;
    //* validar que la logitud de los numeros seleccionados en la card sean iguales o mayores a las reglas
    const countRulePosition = this.gameRule.rule.length;
    const countMarked = this.cardsList[postion].nums.flat().filter(cell => cell.marked).length;
    if (countMarked < countRulePosition) return;

    //* validar que los números de la card esten seleccionados segun la posicion de la regla
    const card = this.cardsList[postion];
    for (let row = 0; row < card.nums.length; row++) {
      for (let col = 0; col < card.nums[row].length; col++) {
        if (this.gameRule.rule.includes(`${row}:${col}`) && !card.nums[row][col].marked) return;
      }
    }
    
    //* enviar para verificar
    this.toastServ.openToast('sing-'+postion, 'success', 'Has cantado BINGO!!!, espera mientras el administrador valida tu tabla');
    this.socketServ.singBingo(this.eventData.id, this.cardsList[postion].id);
  }
}
