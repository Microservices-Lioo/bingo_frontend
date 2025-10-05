import { AfterViewInit, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AwardServiceShared,
  CardsServiceShared,
  EventServiceShared,
  ToastService,
  WebsocketServiceShared
} from '../../../shared/services';
import { BallStatusComponent } from './ball-status/ball-status.component';
import { initFlowbite } from 'flowbite';
import { GamesService } from '../services/games.service';
import {
  AwardGameInterface,
  IGame,
  IGameMode,
  INumberHistory,
  IRoom,
  StatusAward
} from '../interfaces';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  IAwardShared,
  IEventAwardsShared,
  ICardNumsShared,
  ICardShared,
  IEventUpdateShared,
  ITableWinners
} from '../../../shared/interfaces';
import { StatusConnectionComponent } from '../../../shared/components/status-connection/status-connection.component';
import { AuthService } from '../../auth/services';
import { initTabs } from 'flowbite';
import { CalledBallsService } from '../services/called-balls.service';
import { firstValueFrom, lastValueFrom, Subscription } from 'rxjs';
import { CustomButtonComponent } from "../../../shared/components/ui/button/custom-button.component";
import { EStatusTableBingoShared } from '../../../shared/enums';
import { IWinnerValidationData, ValidateBingoModalComponent } from './validate-bingo-modal/validate-bingo-modal.component';
import { WinnerRouletteModalComponent } from './winner-roulette-modal/winner-roulette-modal.component';
import { HostActivity, StatusGame, StatusHostRoom } from '../enums';

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [
    BallStatusComponent,
    ReactiveFormsModule,
    StatusConnectionComponent,
    CustomButtonComponent,
    ValidateBingoModalComponent,
    WinnerRouletteModalComponent
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
  protected room!: IRoom;
  protected event!: IEventAwardsShared;
  protected cardsList!: ICardShared[];
  protected game: IGame | null = null;
  protected gameMode: IGameMode[] = [];
  protected awardsList!: AwardGameInterface[];
  protected numberHistory: INumberHistory | null = null;

  protected StatusHostRoom = StatusHostRoom;
  // Estados de WS
  statusConnection: 'connected' | 'disconnected' | 'reconnecting' | 'failed' = 'disconnected';
  // Mensajes de sala
  titleMsgConnection: string = '';
  textMsgConnection: string = '';

  protected IsAdmin: boolean = false;
  cardPosition: number = 0; // Posicion de la tabla de bingo actual
  modoActive: 'manual' | 'automatico' = 'manual'; // Modo de juego

  // Formulario de creación de juego
  createGameForm = new FormGroup({
    award_id: new FormControl('', Validators.required),
    mode_id: new FormControl('', Validators.required),
  });;

  statusGame: 'INICIAR' | 'INICIADO' | 'CONCLUIDO' | 'ERROR' = 'INICIAR'; // Estado de sorteo
  textStatusgame = "";

  COL_NAMES = ['B', 'I', 'N', 'G', 'O']
  INTERVAL_RANGE = 15;
  MAX_NUMBER = 75;

  statusCount = '00';

  tableWinners: ITableWinners[] = [];
  EStatusTableBingo = EStatusTableBingoShared;
  HostActivity = HostActivity;
  hostActivity: HostActivity = HostActivity.ESPERANDO;

  // Modal de Validación de canto
  isModalOpen = signal(false);
  possibleWinners = signal<ITableWinners[]>([]);
  currentValidationData = signal<IWinnerValidationData | null>(null);

  // Modal de sorteo de ganadores
  isModalOpenWR = signal(false);
  currentValidationDataWR = signal<ITableWinners[]>([]);
  awardWr = signal<IAwardShared | null>(null);
  isLoadingCulminate = signal<boolean>(false);

  // Iniciar sala
  connectedPlayers: number = 0;
  textMsgForm = "";

  countdownGame = 0; // Contador de inicio de juego
  textSings?: string;

  private subscriptions: Subscription[] = [];
  private intervalBtnSinger?: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authServ: AuthService,
    private gameServ: GamesService,
    private calledBallServ: CalledBallsService,
    private toastServ: ToastService,
    private eventSharedServ: EventServiceShared,
    private awardSharedServ: AwardServiceShared,
    private socketServ: WebsocketServiceShared,
    private cardsServiceShared: CardsServiceShared,
  ) { }

  async ngOnInit() {
    const eventId = this.route.snapshot.paramMap.get('id');
    const buyer = this.route.snapshot.paramMap.get('userId');
    if (!eventId || !buyer) {
      this.router.navigate(["/"]);
      return;
    }
    try {
      const room = await firstValueFrom(
        this.gameServ.findRoomByEvent(eventId)
      );
      this.socketServ.initWS(room.id);

      //* Web Socket subscriptions
      this.subscriptionsWs();

      this.room = room;

    } catch (error: any) {
      console.error(error);
      this.router.navigate(['..']);
      this.toastServ.openToast('obtener-sala', 'danger', error.message);
    }

    await this.getEventWithAwards(eventId); // Obtengo datos del evento
    await this.initializateDataGame(); // Inicializo variables para el juego
  }

  ngAfterViewInit() {
    initFlowbite();
    initTabs();
  }

  ngOnDestroy() {
    if (this.room) {
      this.socketServ.disconnect(this.room.id);
      this.subscriptions.forEach(sub => sub.unsubscribe());
    }
  }

  // Mensaje de estados de la sala
  messageStatusRoom() {
    if (this.room.status === 'NOT_STARTED') {
      this.titleMsgConnection = 'Sala no iniciada'
      this.textMsgConnection = 'Está sala aun no inicia. Espera a que llegue la hora del evento'
    } else if (this.room.status === 'FINISHED') {
      this.titleMsgConnection = 'Sala finalizada'
      this.textMsgConnection = 'Está sala ya finalizó. Puedes ver los resultados del evento en tu panel de adminitración > participaciones'
    } else if (this.room.status === 'CANCELED') {
      this.titleMsgConnection = 'Sala cancelada'
      this.textMsgConnection = 'Está sala se ha cancelado. El dinero será reembolsado a los que compraron su tabla de bingo'
    } else if (this.room.status_host === 'OFFLINE') {
      this.titleMsgConnection = 'Sala sin anfitrión'
      this.textMsgConnection = 'Sala en espera, el anfitrión no está conectado'
    }
  }

  subscriptionsWs() {
    // Estados del ws
    this.subscriptions.push(
      this.socketServ.getConnectionStatus().subscribe({
        next: (status) => {
          if (status === 'connected') {
            this.titleMsgConnection = 'Conectado';
            this.textMsgConnection = 'Estas conectado a la sala';
            this.messageStatusRoom();
          } else if (status === 'disconnected') {
            this.titleMsgConnection = 'Has sido desconectado';
            this.textMsgConnection = 'No tienes acceso a esta sala';
          } else if (status === 'reconnecting') {
            this.titleMsgConnection = 'Intento de reconexión';
            this.textMsgConnection = 'Espera un momento mientras te incorporamos a la sala...';
          } else if (status === 'failed') {
            this.titleMsgConnection = 'Error de conexión';
            this.textMsgConnection = 'No se pudo conectar. Por favor, recarga la página o intenta más tarde.';
          } else if (status === 'uninitiated') {
            this.titleMsgConnection = 'La sala no inicia';
            this.textMsgConnection = 'Sala no iniciada. Por favor, espera hasta el dia del evento';
          } else if (status === 'offline_host') {
            this.titleMsgConnection = 'El anfitrión no está activo';
            this.textMsgConnection = 'Espera a que el anfitrión se conecte';
          }
          this.statusConnection = status;
        }
      })
    );

    // Cantidad de usuarios en la sala
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

    // Actualización de estado del host
    this.subscriptions.push(
      this.socketServ.statusHost$.subscribe({
        next: (value) => {
          if (this.room) {
            this.room.status_host = value;
            this.messageStatusRoom();
          }
        },
        error: (error) => {
          console.error(error);
        }
      })
    );

    // Actualización de estado de la sala
    this.subscriptions.push(
      this.socketServ.statusRoom$.subscribe({
        next: (value) => {
          if (this.room) {
            this.room.status = value;
          }
        },
        error: (error) => {
          console.error(error);
        }
      })
    );

    // Actualización de estado del juego
    this.subscriptions.push(
      this.socketServ.statusRaffle$.subscribe({
        next: async (value) => {
          if (value) {
            this.updateStatusGame(value);

            if (value === 'INICIADO') {
              const maxCount = 10;
              this.countdownGame = maxCount;

              const interval = setInterval(() => {
                this.countdownGame--;

                if (this.countdownGame <= 0) {
                  clearInterval(interval);
                }
              }, 1000);

            }
            if (value === 'CONCLUIDO') {
              // Limpiar las tablas de bingo
              const ids = this.cardsList.map( card => card.id);
              const cards = await lastValueFrom(
                this.cardsServiceShared.resetCards(this.event.id, ids)
              );
              this.cardsList = cards.map(card => ({ ...card, nums: card.nums[0].map((_, colIndex) => card.nums.map(row => row[colIndex])) }));

              // Actualizar los premios
              await this.getAwards()

              // Limpiar los datos
              this.clearDataGame();
            }
          }
        },
        error: (error) => {
          console.error(error);
        }
      })
    );

    // Actualización de los datos del juego de la sala
    this.subscriptions.push(
      this.socketServ.game$.subscribe({
        next: async (game) => {
          if (game) {
            this.game = game;

            // obtengo de nuevo los premios
            await this.getAwards();
          }
        },
        error: (error) => {
          console.error(error);
        }
      })
    );

    // Obtención de ultima celda cantada
    this.subscriptions.push(
      this.socketServ.getCellCard$.subscribe({
      next: async (value) => {
        if (this.intervalBtnSinger) {
          clearInterval(this.intervalBtnSinger);
          this.intervalBtnSinger = undefined;
        }

        if(value) {
          this.textSings = value;

          const lastNumber = parseInt(value.split(' - ')[1]);
          this.calledBallServ.setLastItem(lastNumber);
          // disparador automatico
          this.cellSelectedAuto(lastNumber);
          
          if (this.numberHistory) {
            this.numberHistory.nums.push(lastNumber);
          } else {
            if (!this.game || !this.game.numberHistoryId) {
              await this.getGame()
            };

            const numberHist = await this.getNumberHistory(this.game!.numberHistoryId);
            if (!numberHist) return;
            this.numberHistory = numberHist;
          }

        }        
      },
      error: (error) => {
        console.error('Error en getCellCard$:', error);
        if (this.intervalBtnSinger) {
          clearInterval(this.intervalBtnSinger);
        }
        this.statusGame = 'ERROR';
        this.toastServ.openToast('cell-card-error', 'danger', 'Error al obtener número');
      }}
    )
    );

    // Actualización de contador regresivo
    this.subscriptions.push(
      this.socketServ.statusCount$.subscribe(state => {
        if (!state && this.hostActivity == HostActivity.CANTANDO && this.IsAdmin) {
            this.socketServ.updateHostActivity(HostActivity.ESPERANDO)
        }

        if (state) {          
          const update = () => {
            const msLeft = state.endTime - Date.now();
            const secLeft = Math.max(Math.floor(msLeft / 1000), 0);

            this.statusCount = secLeft.toString().padStart(2, '0');
            return secLeft;
          }

          let remaining = update();

          const interval = setInterval(() => {
            remaining = update();
            if (remaining <= 0) {
              if (this.hostActivity == HostActivity.CANTANDO && this.IsAdmin) {
                this.socketServ.updateHostActivity(HostActivity.ESPERANDO)
              }
              clearInterval(interval); // detener cuando llegue a 0
            }
          }, 1000);
        }
      })
    );

    // Actualización de tabla de cantos
    this.subscriptions.push(
      this.socketServ.tableWinner$.subscribe(value => {
        if (value) {
          const { table, sing } = value;
          const original = table ? [...table] : [];
          this.tableWinners = original;
          if (sing) {
            if (sing.status === EStatusTableBingoShared.APROBADO) {
              this.toastServ.openToast('my-bingo', 'success', `Tu canto ha sido ${sing.status}`);
            } else if (sing.status === EStatusTableBingoShared.PENDIENTE) {
              this.toastServ.openToast('my-bingo', 'warning', `Tu canto ha sido ${sing.status}`);
            } else {
              this.toastServ.openToast('my-bingo', 'danger', `Tu canto ha sido ${sing.status}`);
            }            
          }
        }
      })
    );

    // Verificación de canto del usuario
    this.subscriptions.push(
      this.socketServ.myBingo$.subscribe(value => {
        if (value) {
          this.toastServ.openToast('my-bingo', 'warning', value);
        }
      })
    );

    // Evento de premiación
    this.subscriptions.push(
      this.socketServ.winnerModal$.subscribe(modal => {
        if (this.IsAdmin) return;
        if (modal) {
          const { isOpen } = modal;
          if (isOpen) {
            this.openValidationWinners();
          } else {
            this.closeModalWR();
          }
        }
      })
    );

    // Evento de la actividad del host
    this.subscriptions.push(
      this.socketServ.hostActivity$.subscribe(activity => {
        if (!activity) return;

        this.hostActivity = activity;        
      })
    );
  }

  // Método para inicializar un juego
  async initializateDataGame() {
    this.updateStatusGame(StatusGame.INICIAR);

    // Obtener los modos
    await this.getGameMode();

    // el juego
    const game = await this.getGame();
    if (!game) return;

    this.updateStatusGame(StatusGame.INICIADO);
    
    // obtengo los números cantados
    if (!game.numberHistoryId) return;
    const numberHist = await this.getNumberHistory(game.numberHistoryId);
    
    if (!numberHist) return;

    this.numberHistory = numberHist;

    const num = numberHist.nums[0];
    const index = Math.ceil(num / this.INTERVAL_RANGE) - 1;
    this.textSings = `${this.COL_NAMES[index]} - ${num}`;
  }

  // Tranforma la lista de awards agregando un nuevo atributo
  async transformAwardList(awards: IAwardShared[]) {
    let awardsList = awards.map(award => ({
      ...award,
      status: award.gameId && !award.winner ? StatusAward.NOW : award.gameId && award.winner ? StatusAward.END : StatusAward.PROX
    }));

    this.awardsList = this.orderAwards(awardsList);
  }

  // Método para obtener datos del evento (event) y sus premios (awards) asociados
  async getEventWithAwards(eventId: string) {
    this.eventSharedServ.getEventWithAwards(eventId).subscribe({
      next: async (event) => {
        this.event = event;

        const currentUserId = this.authServ.currentUser.id;
        const owner = event.userId;
        if (currentUserId !== owner) {
          await this.getCardsList(eventId);
        }

        this.IsAdmin = currentUserId === owner;

        await this.transformAwardList(event.award);
      },
      error: (error) => {
        console.error(error);
        this.toastServ.openToast('get-event-awards', 'danger', error.message);
      }
    });
  }

  // Método para obtener los premios del evento
  async getAwards() {
    this.awardSharedServ.getAwards(this.room.eventId).subscribe({
      next: async (awards) => {

        await this.transformAwardList(awards);
      },
      error: (error) => {
        console.error(error);
        this.toastServ.openToast('get-awards', 'danger', 'Error al obtener los premios');
      }
    });
  }

  // Método para obtener las tablas de bingo(cards) del usuario jugador
  async getCardsList(eventId: string) {
    this.cardsServiceShared.findToEventByBuyer(eventId)
      .subscribe({
        next: (cards) => {
          if (cards.length === 0) {
            this.toastServ.openToast('card', 'danger', 'No tienes tablas para este evento');
            this.router.navigate(['/']);
          } else {
            this.cardsList = cards.map(card => ({ ...card, nums: card.nums[0].map((_, colIndex) => card.nums.map(row => row[colIndex])) }));
          }
        },
        error: (error) => {
          this.toastServ.openToast('card', 'danger', error.message);
          this.router.navigate(['/']);
        }
      });
  }

  // Método para actualizar la celda seleccionada por el usuario en su tabla
  async cellSelected(cardId: string, cel: ICardNumsShared, position?: number) {
    const { num, marked } = cel;

    const card = this.cardsList[position ?? this.cardPosition];
    const newNums = card.nums.map(cell => {
      const newCell = cell.map(pos => pos.num === num ? { ...pos, marked: !pos.marked } : pos);
      return newCell;
    });
    this.cardsList[position ?? this.cardPosition] = { ...card, nums: newNums};
    
    try {
      await lastValueFrom(
        this.cardsServiceShared.checkOrUncheckBoxCard(cardId, num, !marked)
      );
    } catch (error) {
      console.error(error);
      this.toastServ.openToast('cell-selected', 'danger', 'Error al actualizar la celda seleccionada');
      this.cardsList[this.cardPosition] = card; 
    }
  }

  // Obtener el ultimo juego de la sala activo
  async getGame() {
    try {
      const game = await lastValueFrom(
        this.gameServ.findGameToRoom(this.room.id)
      );
  
      if (!game) {
        this.updateStatusGame(StatusGame.INICIAR);
        return undefined;
      }
      this.game = game;
      return game;    
    } catch (error) {
      console.error(error);
        this.updateStatusGame(StatusGame.ERROR);
      this.toastServ.openToast('get-game', 'danger', 'Error al obtener el juego actual');
      return undefined;
    }
  }

  // Obtener los números cantados
  async getNumberHistory(id: string) {
    try {
      const numberHistory = await lastValueFrom(
        this.gameServ.getNumberHistory(id)
      );
      if (!numberHistory) return undefined;
      this.calledBallServ.setItems(numberHistory.nums);
      this.calledBallServ.setLastItem(numberHistory.nums.reverse()[0]);
      return numberHistory;
    } catch (error) {
      console.error(error);
      this.toastServ.openToast('get-number-history', 'danger', 'Error al obtener el historial de números cantados');
      return undefined;
    }
  }

  // Crear el juego de la sala
  createGame() {
    if (this.game) {
      this.toastServ.openToast('game', 'warning', 'Ya existe un juego en curso');
      return;
    }

    this.textMsgForm = '';
    if (this.createGameForm.invalid) {
      this.textMsgForm = "El formulario no es incorrecto";
      return;
    }

    const awardId = this.createGameForm.value.award_id!;
    const modeId = this.createGameForm.value.mode_id!;

    this.socketServ.createGame(awardId, modeId);
    this.socketServ.statusGame('INICIADO');
    this.updateStatusGame(StatusGame.INICIADO);

    const maxCount = 10;
    this.countdownGame = maxCount;

    const interval = setInterval(() => {
      this.countdownGame--;

      if (this.countdownGame <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    this.createGameForm.reset();

  }

  // Método para obtener todos los modos de juego que existen
  async getGameMode() {
    this.gameServ.getGameMode().subscribe({
      next: (mode) => {
        if (!mode) {
          this.toastServ.openToast('game-mode', 'danger', 'No existen modos de juego');
          return;
        }

        this.gameMode = mode;
      },
      error: (error) => {
        console.error(error);
        this.toastServ.openToast('game-mode-form', 'danger', 'Error al obtener los modos de juego');
      }
    });
  }

  // Obtener el modo de juego seleccionado
  get modeSelected(): IGameMode | undefined {
    if (!this.game) return undefined;
    if (this.gameMode.length === 0) return undefined;

    const mode = this.gameMode.find(mode => mode.id === this.game?.modeId);
    return mode;
  }

  // Verificar el si la celda tiene la regla en el modo de juego
  verifyRule(idrow: number, idcol: number) {
    if (!this.modeSelected) return false;
    return this.modeSelected.rule.includes(`${idrow}:${idcol}`);
  }

  // Método para cambiar de modo para un juego manual o automático
  modoSelect(modo: 'manual' | 'automatico') {
    if (this.IsAdmin) return;
    this.modoActive = modo;
  }

  // Método para cantar un número no cantado durante el juego
  btnSinger() {
    if (this.tableWinners.length > 0) {
      this.toastServ.openToast('possible-winners', 'warning', 'Tienes posibles ganadores');
      return;
    }

    if (!this.game || !this.gameMode) {
      this.toastServ.openToast('btn-singer', 'warning', 'El juego no esta inicializado');
      this.updateStatusGame(StatusGame.INICIAR);
      return;
    }
    
    if (this.statusCount !== '00') {
      this.toastServ.openToast('btn-status-count', 'warning', 'Espera a que se agote el tiempo de espera');
      return;
    }

    if (this.intervalBtnSinger || this.hostActivity !== HostActivity.ESPERANDO) {
      this.toastServ.openToast('btn-interval', 'warning', 'Espera a que termine la solicitud');
      return;
    }

    if (this.numberHistory && this.numberHistory.nums.length >= this.MAX_NUMBER) {
      this.updateStatusGame(StatusGame.CONCLUIDO);
      this.clearDataGame();
      return;
    }

    let colName = '';
    let num = 0;
    const intervalTime = 100;

    colName = this.COL_NAMES[Math.floor(Math.random() * this.COL_NAMES.length)];
    num = Math.floor(Math.random() * this.MAX_NUMBER) + 1;

    const interval = setInterval(async () => {
        colName = this.COL_NAMES[Math.floor(Math.random() * this.COL_NAMES.length)];
        num = Math.floor(Math.random() * this.MAX_NUMBER) + 1;
        this.textSings = `${colName} - ${num}`;
    }, intervalTime) as any;
    this.intervalBtnSinger = interval;
    const {id} = this.game;
    this.socketServ.cellCard(id); // Emito la solicitud para generar un campo válido
    this.socketServ.updateHostActivity(HostActivity.MEZCLANDO); // Emito la soli de la actividad del host
  }

  //Actualizar status ranfle
  updateStatusGame(status: StatusGame) {
    this.statusGame = status;
    if (status === StatusGame.INICIAR) {
      this.textStatusgame = 'El host está crean el juego, espera un momento';
    } else if (status == StatusGame.INICIADO) {
      this.textStatusgame = 'El juego está en curso';
    } else if (status === StatusGame.CONCLUIDO) {
      this.textStatusgame = 'El juego ha terminado, espera mientras el host configura el próximo juego';
    } else {
      this.textStatusgame = '1Error en la creación del juego, espera mientras resolvemos';
    }
  }

  // Método para ordenar un array numerico de manera ascendente
  sortAscendantForNumber(array: number[]) {
    return array.sort((a, b) => a - b);
  }

  // Método para ordenar un array de objetos de manera ascendente
  sortAscendantForObject(array: ICardNumsShared[][]) {
    const arrayFlat = array.flat();
    return arrayFlat.sort((a, b) => a.num - b.num);
  }

  // Método para seleccionar una celada manualmente al dar click
  async btnCellSelected(cardId: string, cel: ICardNumsShared, position: string) {
    this.modoActive = 'manual';
    
    if (!this.game) {
      this.toastServ.openToast('game', 'warning', 'El juego aun no inicia');
      return;
    }
    if (position === '2,2') return;
    await this.cellSelected(cardId, cel);
  }
  
  // Método para seleccionar una celada manualmente al dar click
  async cellSelectedAuto(num: number) {
    if (this.modoActive === 'automatico') {
      this.cardsList.forEach((card, i) => {
        const cell = card.nums.flat().find(pos => pos.num === num);
        if (cell) {
          this.cellSelected(card.id, cell, i);
        }
      });
    }
  }

  // Método para limpiar los datos de un juego concluido
  clearDataGame() {
    this.game = null;
    this.numberHistory = null;
    this.calledBallServ.setItems([]);
    this.calledBallServ.setLastItem(0);

    this.tableWinners = [];
  }

  // Método para ordener los premios por categoria
  orderAwards(awardsList: AwardGameInterface[]): AwardGameInterface[] {
    const order = ['NOW', 'PROX', 'END'];

    return awardsList.sort((a, b) => {
      return order.indexOf(a.status) - order.indexOf(b.status);
    });
  }

  getCurrentUserId() {
    return this.authServ.currentUser.id;
  }

  // Abre el modal de validación con toda la información necesaria
  async openValidationModal(winner: ITableWinners): Promise<void> {
    try {
      const nums = await this.getCardNums(winner.cardId);

      if (!nums) {
        return;
      }

      // Datos de ejemplo para demostración
      const mockCard: ICardShared = {
        id: winner.cardId,
        eventId: this.event.id,
        buyer: winner.userId,
        available: true,
        nums
      };

      const mockGameMode: IGameMode = this.modeSelected!

      const mockHistory: INumberHistory = this.numberHistory!

      // Construir los datos de validación
      const validationData: IWinnerValidationData = {
        winner,
        card: mockCard,
        gameMode: mockGameMode,
        numberHistory: mockHistory
      };

      this.currentValidationData.set(validationData);
      this.isModalOpen.set(true);

    } catch (error) {
      console.error('Error al abrir modal de validación:', error);
      this.toastServ.openToast('open-modal', 'danger', 'Error al abrir el modal de validación')
    }
  }

  // Cierra el modal
  closeModal(): void {
    this.isModalOpen.set(false);
    setTimeout(() => {
      this.currentValidationData.set(null);
    }, 300);
  }

  // Maneja la aprobación de un canto
  async handleAccept(winner: ITableWinners): Promise<void> {
    try {

      this.socketServ.updateBingo(winner.cardId, EStatusTableBingoShared.APROBADO);

      this.closeModal();

    } catch (error) {
      console.error('Error al aprobar canto:', error);
      this.toastServ.openToast('handle-accept', 'danger', 'Error al aprobar el canto');
    }
  }

  //Maneja el rechazo de un canto
  async handleReject(winner: ITableWinners): Promise<void> {
    try {
      this.socketServ.updateBingo(winner.cardId, EStatusTableBingoShared.RECHAZADO);

      this.closeModal();

    } catch (error) {
      console.error('Error al rechazar canto:', error);
      this.toastServ.openToast('handle-reject', 'danger', 'Error al rechazar el canto');
    }
  }

  // Rechazo rápido sin abrir el modal
  async quickReject(winner: ITableWinners): Promise<void> {
    if (confirm('¿Estás seguro de rechazar este canto sin revisarlo?')) {
      await this.handleReject(winner);
    }
  }

  // Abrir modal de validación para sortear ganadores
  openValidationWinners() {

    // Abro el modal de premiación para todos los jugadores
    this.socketServ.winnerModal(true);
    // awardsList
    this.currentValidationDataWR.set(this.tableWinners);
    const award = this.awardsList.find(award => award.status === StatusAward.NOW);
    if (!award) {
      this.toastServ.openToast('open-winner-modal', 'warning', 'No se encontró un premio disponible');
      return;
    }
    this.awardWr.set(award);
    this.isModalOpenWR.set(true);
  }

  // Cierra el modal
  closeModalWR() {
    if (this.IsAdmin) {
      // cierro el modal de premiación para todos los jugadores
      this.socketServ.winnerModal(false);
    }

    this.isModalOpenWR.set(false);
    setTimeout(() => {
      this.currentValidationDataWR.set([]);
    }, 300);
  }

  // Obtención del ganador
  async handleFinishWR(winner: ITableWinners) {
    try {
      // cargar un loading
      this.isLoadingCulminate.set(true);

      const { cardId } = winner;
      const { id: gameId, } = this.game!;

      // Actualizar el premio de award por gameId y asignar al ganador winner (cardId)
      const awardNow = this.awardsList.find(a => a.status === StatusAward.NOW);

      if (!awardNow || !awardNow.gameId) {
        this.toastServ.openToast('award-game', 'danger', 'Premio no encontrado');
        return;
      }
      const updateAward = await lastValueFrom(
        this.awardSharedServ.updateAward(awardNow.id, gameId, cardId)
      );

      const newAwards = this.awardsList.map(a => a.id === awardNow.id ? { ...a, winner: updateAward.winner, status: StatusAward.END } : a);
      this.awardsList = newAwards;

      // Actualizar el end_time de game
      const updateGame = await lastValueFrom(
        this.gameServ.updateGame(gameId, { end_time: new Date()})
      );

      this.socketServ.statusGame(StatusGame.CONCLUIDO);
      this.updateStatusGame(StatusGame.CONCLUIDO);

      // Limpiar los datos
      this.clearDataGame();

      this.isLoadingCulminate.set(false);
      this.closeModalWR();
    } catch (error) {
      console.error(error);
      this.toastServ.openToast('finish-game', 'danger', 'Error al culminar el juego');
      this.isLoadingCulminate.set(false);
      this.closeModalWR();
    }
  }

  // Obtención de los numeros de la tabla del usuario
  private async getCardNums(cardId: string): Promise<ICardNumsShared[][] | null> {
    try {
      const card = await lastValueFrom(
        this.cardsServiceShared.getCardById(cardId)
      );
  
      if (!card) {
        this.toastServ.openToast('get-card', 'warning', 'No se encontro la tabla de bingo');
        return null;
      }

      const newCard = card.nums[0].map((_, colIndex) => 
        card.nums.map(row => row[colIndex])
      );
      return newCard;
      
    } catch (error) {
      console.error(error);
      this.toastServ.openToast('get-card', 'warning', 'Error al obtener la tabla de bingo');
      return null;
    }
    
  }

  // Método para actualizar el estado del evento
  async updateStatusEvent(eventId: string, data: IEventUpdateShared) {
    this.eventSharedServ.updateStatusEvent(eventId, data)
      .subscribe({
        complete: () => console.log('Evento actualizado'),
        error: (error) => {
          this.toastServ.openToast('event', 'danger', error.message);
        }
      });
  }
  
  // todo: Hacer Método para limpiar la tabla de cantos
  deleteAllSongs() {
    if (!this.event) return this.toastServ.openToast('song-verify', 'danger', 'El evento no está inicializado');
    const { id: roomId } = this.event;
  }

  // Método para cambiar la posicion de la tabla de bingo (card) presentada a la siguiente.
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

  // Método para cambiar la posicion de la tabla de bingo (card) presentada a la anterior.
  btnPrevCard() {
    if (!this.cardsList || this.cardsList.length < 0 || this.cardPosition < 0) {
      this.toastServ.openToast('next-card', 'danger', 'Tablas no inicializadas o la posicion no existe');
      return;
    }
    if (this.cardPosition != 0) {
      this.cardPosition = this.cardPosition - 1;
    }
  }

  // Método para cantar bingo, emitido al administrador del juego para posteriormente ser verificado
  async singBingo() {
    if (this.cardPosition < 0) return this.toastServ.openToast('sing', 'danger', 'No hay card seleccionada');
    if (!this.cardsList) return this.toastServ.openToast('sing', 'danger', 'No existe una card asociada a tu usuario');
    if (!this.numberHistory) return this.toastServ.openToast('sing', 'danger', 'No existe una card asociada a tu usuario');
    if (!this.modeSelected) return this.toastServ.openToast('sing', 'danger', 'No existe una card asociada a tu usuario');

    //* enviar para verificar
    this.toastServ.openToast('sing', 'success', 'Has cantado bingo');
    this.socketServ.singBingo(this.cardsList[this.cardPosition].id, this.numberHistory?.id, this.modeSelected?.id);
  }
}
