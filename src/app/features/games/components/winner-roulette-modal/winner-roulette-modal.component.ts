/** 
import { Component, input, OnDestroy, OnInit, output, signal } from '@angular/core';
import { EStatusTableBingoShared } from '../../../../shared/enums';
import { IAwardShared, ITableWinners } from '../../../../shared/interfaces';
import { CustomButtonComponent } from "../../../../shared/components/ui/button/custom-button.component";
import { LoadingComponent } from "../../../../shared/components/loading/loading.component";
import { Subscription } from 'rxjs';
import { WebsocketServiceShared } from '../../../../shared/services';
import { EAwardsStatus, ERouletteStatus } from '../../enums';

@Component({
  selector: 'app-winner-roulette-modal',
  imports: [CustomButtonComponent, LoadingComponent],
  templateUrl: './winner-roulette-modal.component.html',
  styles: `
  .clip-circle {
  clip-path: polygon(50% 50%, 100% 0, 100% 100%);
}
  `
})
export class WinnerRouletteModalComponent implements OnInit, OnDestroy {
  // Inputs
  isOpen = input.required<boolean>();
  winners = input.required<ITableWinners[]>(); // lista de todos los jugadores
  award = input.required<IAwardShared>(); // lista de todos los jugadores
  isAdmin = input<boolean>(false); // Administrador
  isLoading = input<boolean>(false); // Indicador de culminación

  // Outputs
  close = output<void>();
  finish = output<ITableWinners>(); // emite el ganador final

  // Signals necesarios
  currentRotation = signal(0);
  spinning = signal(false);
  selectedWinner = signal<ITableWinners | null>(null);
  isAwarding = signal(false);
  isTransitioning = signal(false);

  private spinInterval: any = null;
  private currentSpeed = 0;
  private targetRotation = 0;

  private colors = [
    '#0ea5e9', // sky-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#f59e0b', // amber-500
    '#10b981', // emerald-500
    '#3b82f6', // blue-500
  ];

  private subscriptions: Subscription[] = [];

  // Estados de la ruleta y el ganador
  awardStatus?: EAwardsStatus;
  rouletteStatus: ERouletteStatus = ERouletteStatus.NO_INICIADA;

  constructor(
    private socketServ: WebsocketServiceShared
  ) { }

  ngOnInit() {
    if (this.winners().length === 1) {
      this.selectedWinner.set(this.winners()[0]);
    }
    this.subscriptionsWs();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  subscriptionsWs() {
    // Evento de la premiación
    this.subscriptions.push(
      this.socketServ.awardStatus$.subscribe(status => {
        if (!status) return;

        this.awardStatus = status;
      })
    );

    // Evento de la ruleta de sorteo
    this.subscriptions.push(
      this.socketServ.rouletteStatus$.subscribe(status => {
        if (!status) return;
        this.rouletteStatus = status;
        if (this.spinInterval || status === ERouletteStatus.DETENIDA) return;
        this.continueRulette();
      })
    );

    // Evento de la posición del ganador en la ruleta
    this.subscriptions.push(
      this.socketServ.rouletteWinner$.subscribe(data => {
        if (!data) return;

        const { targetRotation, winnerIndex } = data;
        this.stopSpinAt(targetRotation, winnerIndex);
      })
    );
  }

  cleanData() {
    this.currentRotation.set(0);
    this.spinning.set(false);
    this.selectedWinner.set(null);
    this.isAwarding.set(false);
    this.isTransitioning.set(false);

    this.spinInterval = null;
    this.currentSpeed = 0;
    this.targetRotation = 0;
    this.awardStatus = undefined;
    this.rouletteStatus = ERouletteStatus.NO_INICIADA;
  }

  continueRulette() {
    if (this.rouletteStatus === ERouletteStatus.NO_INICIADA) return;

    this.spinOrStop();
  }

  concludeGame() {
    if (this.winners().length === 1) {
      this.finish.emit(this.winners()[0]);
      return;
    }

    if (this.selectedWinner()) {
      this.finish.emit(this.selectedWinner()!);
    }
  }

  closeModal(): void {
    this.cleanData();
    this.close.emit();
  }

  // Obtiene el color para un segmento específico
  getSegmentColor(index: number): string {
    return this.colors[index % this.colors.length];
  }

  // Genera el path SVG para un segmento circular perfecto
  // Dibuja una "rebanada de pastel" desde el centro
  getSegmentPath(index: number): string {
    const segments = this.winners().length;
    const anglePerSegment = 360 / segments;
    const startAngle = index * anglePerSegment;
    const endAngle = startAngle + anglePerSegment;

    const centerX = 100;
    const centerY = 100;
    const radius = 96; // Un poco menos que 100 para dejar espacio al borde

    // Convertir ángulos de grados a radianes
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Calcular puntos en el borde del círculo
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    // Determinar si necesitamos un arco grande (> 180°)
    const largeArcFlag = anglePerSegment > 180 ? 1 : 0;

    // Construir el path:
    // M = mover al centro
    // L = línea al primer punto del arco
    // A = dibujar arco
    // Z = cerrar path volviendo al inicio
    return `M ${centerX},${centerY} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z`;
  }

  // Calcula la posición X del texto en el centro del segmento
  getTextX(index: number): number {
    const segments = this.winners().length;
    const anglePerSegment = 360 / segments;
    const angle = index * anglePerSegment + anglePerSegment / 2; // Centro del segmento
    const radius = 60; // Distancia del centro para el texto
    const angleRad = (angle * Math.PI) / 180;
    return 100 + radius * Math.cos(angleRad);
  }

  // Calcula la posición Y del texto en el centro del segmento
  getTextY(index: number): number {
    const segments = this.winners().length;
    const anglePerSegment = 360 / segments;
    const angle = index * anglePerSegment + anglePerSegment / 2;
    const radius = 60;
    const angleRad = (angle * Math.PI) / 180;
    return 100 + radius * Math.sin(angleRad);
  }

  // Calcula la rotación del texto para que sea legible
  getTextTransform(index: number): string {
    const segments = this.winners().length;
    const anglePerSegment = 360 / segments;
    const angle = index * anglePerSegment + anglePerSegment / 2;
    const x = this.getTextX(index);
    const y = this.getTextY(index);

    // Rotar el texto 90° más el ángulo del segmento para que quede perpendicular al radio
    return `rotate(${angle + 90}, ${x}, ${y})`;
  }

  // Alterna entre iniciar y detener el giro
  spinOrStop() {
    if (this.spinning()) {
      this.stopSpin();
      if (this.rouletteStatus != ERouletteStatus.GIRANDO && this.isAdmin()) {
        this.socketServ.updateRouletteStatus(ERouletteStatus.DETENIDA);
      }
    } else {
      this.startSpin();
      if (this.rouletteStatus != ERouletteStatus.GIRANDO && this.isAdmin()) {
        this.socketServ.updateRouletteStatus(ERouletteStatus.GIRANDO);
      }
    }
  }

  // Inicia el giro continuo de la ruleta
  private startSpin() {
    this.spinning.set(true);
    this.selectedWinner.set(null);
    this.currentSpeed = 20; // Velocidad de giro

    // Girar continuamente mientras está activo
    this.spinInterval = setInterval(() => {
      this.currentRotation.update(rot => (rot + this.currentSpeed) % 360);
    }, 16); // ~60 FPS
  }

  // Detiene el giro y selecciona un ganador aleatorio
  private stopSpin() {
    if (this.spinInterval) {
      clearInterval(this.spinInterval);
    }

    // Calcular rotación final aleatoria
    const segmentAngle = 360 / this.winners().length;
    const randomSegment = Math.floor(Math.random() * this.winners().length);
    const baseRotation = randomSegment * segmentAngle;

    // Añadir un offset aleatorio dentro del segmento para que parezca más natural
    const randomOffset = Math.random() * segmentAngle * 0.8 + segmentAngle * 0.1;

    // Añadir vueltas extra para efecto visual dramático
    const extraSpins = 1440; // 4 vueltas completas (360 * 4)
    this.targetRotation = extraSpins + baseRotation + randomOffset;

    // Aplicar rotación final con transición suave CSS
    this.currentRotation.set(this.targetRotation);

    setTimeout(() => {
      // La flecha apunta hacia arriba (0°), calcular qué segmento está ahí
      const normalizedRotation = (this.targetRotation % 360 + 360) % 360;
      // Calcular en sentido INVERSO porque la ruleta gira horario pero los segmentos van antihorario
      const winnerIndex = Math.floor((360 - normalizedRotation) / segmentAngle) % this.winners().length;
      this.socketServ.updateRouletteWinner({ targetRotation: this.targetRotation, winnerIndex });
      this.socketServ.updateRouletteStatus(ERouletteStatus.DETENIDA);
      this.socketServ.updateAwardStatus(EAwardsStatus.PREMIADO);
      this.rouletteStatus = ERouletteStatus.DETENIDA;
      this.selectedWinner.set(this.winners()[winnerIndex]);
      this.spinning.set(false);
      this.isTransitioning.set(false);
      this.isAwarding.set(true);
    }, 3000); // Debe coincidir con la duración de la transición CSS
  }

  // Detener la ruleta en una rotación especifica
  private stopSpinAt(targetRotation: number, winnerIndex: number) {
    if (this.spinInterval) clearInterval(this.spinInterval);

    this.targetRotation = targetRotation;
    this.currentRotation.set(this.targetRotation);

    setTimeout(() => {
      this.selectedWinner.set(this.winners()[winnerIndex]);
      this.spinning.set(false);
      this.isTransitioning.set(false);
      this.isAwarding.set(true);
    }, 1000);
  }
}
  */

import { Component, effect, input, OnDestroy, OnInit, output, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { CustomButtonComponent } from "../../../../shared/components/ui/button/custom-button.component";
import { LoadingComponent } from "../../../../shared/components/loading/loading.component";
import { WebsocketServiceShared } from '../../../../shared/services';
import { EStatusTableBingoShared } from '../../../../shared/enums';
import { IAwardShared, ITableWinners } from '../../../../shared/interfaces';
import { EAwardsStatus, ERouletteStatus } from '../../enums';

@Component({
  selector: 'app-winner-roulette-modal',
  imports: [CustomButtonComponent, LoadingComponent],
  templateUrl: './winner-roulette-modal.component.html',
  styles: [`.clip-circle { clip-path: polygon(50% 50%, 100% 0, 100% 100%); }`]
})
export class WinnerRouletteModalComponent implements OnInit, OnDestroy {
  // Inputs
  isOpen = input.required<boolean>();
  approved = input.required<ITableWinners[]>();
  award = input.required<IAwardShared>();
  isAdmin = input<boolean>(false);
  isLoadingCulminate = input<boolean>(false);

  // Outputs
  close = output<void>();
  finish = output<ITableWinners>();

  // Signals
  currentRotation = signal(0);
  spinning = signal(false);
  selectedWinner = signal<ITableWinners | null>(null);
  isAwarding = signal(false);
  isTransitioning = signal(false);
  isLoading = signal(false);

  private spinInterval: any = null;
  private currentSpeed = 0;
  private targetRotation = 0;
  private winnerIndex = -1;

  private colors: string[] = [];

  private subscriptions: Subscription[] = [];

  // Estados
  awardStatus?: EAwardsStatus;
  rouletteStatus: ERouletteStatus = ERouletteStatus.NO_INICIADA;

  constructor(private socketServ: WebsocketServiceShared) {
    effect(() => {
        if (this.approved().length === 1) {
          this.selectedWinner.set(this.approved()[0]);
          if (this.isAdmin() && this.awardStatus === EAwardsStatus.PREMIANDO) {
            this.socketServ.updateAwardStatus(EAwardsStatus.PREMIADO);
          }

          this.isLoading.set(true);
          setTimeout(() => {
          this.isLoading.set(false);
          }, 4000);
        }
        if (this.approved().length > 1) {
          this.colors = Array.from({ length: this.approved().length }, () => 
            this.generarColorHexAleatorio()
          );
        }
        if (this.isOpen()) {
          this.winnerRoulette();
        }
    })
  }

  ngOnInit() {    
    this.subscriptionsWs();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  generarColorHexAleatorio() {
    const componenteACadena = () => {
      const valor = Math.floor(Math.random() * 120) + 130;
      return valor.toString(16).padStart(2, '0');
    };
    return `#${componenteACadena()}${componenteACadena()}${componenteACadena()}`;
  }

  getCustomNames(fullnames: string) {
    const names = fullnames.split(' ');
    return `${names[0]} ${names[1]?.slice(0,1)}`;
  }

  // Mantener sincronizados los estados entre sockets y la UI
  subscriptionsWs() {
    // Estado de premiación
    this.subscriptions.push(
      this.socketServ.awardStatus$.subscribe(status => {
        if (!status) return;
        this.awardStatus = status;
        this.isAwarding.set(status === EAwardsStatus.PREMIANDO);
      })
    );

    // Estado de la ruleta
    this.subscriptions.push(
      this.socketServ.rouletteStatus$.subscribe(status => {
        if (!status) return;
        this.rouletteStatus = status;
        this.handleRouletteStatusChange(status);
      })
    );

    // Ganador final
    this.subscriptions.push(
      this.socketServ.rouletteWinner$.subscribe(data => {
        if (!data) return;
        const { targetRotation, winnerIndex } = data;
        this.targetRotation = targetRotation;
        this.winnerIndex = winnerIndex;
        this.stopSpinAt(targetRotation, winnerIndex);
      })
    );
  }

  // Lógica para cargar al ganador
  winnerRoulette() {
    if (this.rouletteStatus === ERouletteStatus.DETENIDA && 
      this.awardStatus === EAwardsStatus.PREMIADO && this.winnerIndex > -1) {
        this.selectedWinner.set(this.approved()[this.winnerIndex]);
        this.isLoading.set(true);
        setTimeout(() => {
          this.isLoading.set(false);
        }, 4000);
      }
  }

  // lógica limpia al cambiar el estado de la ruleta
  private handleRouletteStatusChange(status: ERouletteStatus) {
    switch (status) {
      case ERouletteStatus.GIRANDO:
        if (!this.spinning()) this.startSpin();
        break;

      case ERouletteStatus.DETENIDA:
        // if (this.spinning() && this.spinInterval) clearInterval(this.spinInterval);
        // this.spinning.set(false);
        break;

      case ERouletteStatus.NO_INICIADA:
      default:
        this.cleanData();
        break;
    }
  }

  // Limpieza general
  cleanData() {
    this.currentRotation.set(0);
    this.spinning.set(false);
    this.selectedWinner.set(null);
    this.isAwarding.set(false);
    this.isTransitioning.set(false);
    this.spinInterval = null;
    this.currentSpeed = 0;
    this.targetRotation = 0;
    this.awardStatus = undefined;
    this.rouletteStatus = ERouletteStatus.NO_INICIADA;
  }

  // Alternar giro manual (admin)
  spinOrStop() {
    if (this.spinning()) {
      this.stopSpin();
      if (this.isAdmin()) {
        this.socketServ.updateRouletteStatus(ERouletteStatus.DETENIDA);
      }
    } else {
      this.startSpin();
      if (this.isAdmin()) {
        this.socketServ.updateRouletteStatus(ERouletteStatus.GIRANDO);
      }
    }
  }

  // Iniciar giro continuo
  private startSpin() {
    this.spinning.set(true);
    this.selectedWinner.set(null);
    this.currentSpeed = 20;
    this.spinInterval = setInterval(() => {
      this.currentRotation.update(rot => (rot + this.currentSpeed) % 360);
    }, 16);
  }

  // Detener giro (solo admin)
  private stopSpin() {
    if (this.spinInterval) clearInterval(this.spinInterval);

    const segmentAngle = 360 / this.approved().length;
    const randomSegment = Math.floor(Math.random() * this.approved().length);
    const baseRotation = randomSegment * segmentAngle;
    const randomOffset = Math.random() * segmentAngle * 0.8 + segmentAngle * 0.1;
    const extraSpins = 1440;
    this.targetRotation = extraSpins + baseRotation + randomOffset;

    this.currentRotation.set(this.targetRotation);

    setTimeout(() => {
      const normalizedRotation = (this.targetRotation % 360 + 360) % 360;
      const winnerIndex = Math.floor((360 - normalizedRotation) / segmentAngle) % this.approved().length;
      const winner = this.approved()[winnerIndex];

      // admin informa resultados
      if (this.isAdmin()) {
        this.socketServ.updateRouletteWinner({ targetRotation: this.targetRotation, winnerIndex });
        this.socketServ.updateRouletteStatus(ERouletteStatus.DETENIDA);
        this.socketServ.updateAwardStatus(EAwardsStatus.PREMIADO);
      }

      this.selectedWinner.set(winner);
      this.spinning.set(false);
      this.isTransitioning.set(false);
      this.isAwarding.set(false);
    }, 3000);
  }

  // Detener ruleta con resultado sincronizado (para todos los clientes)
  private stopSpinAt(targetRotation: number, winnerIndex: number) {
    if (this.spinInterval) clearInterval(this.spinInterval);
    this.targetRotation = targetRotation;
    this.currentRotation.set(this.targetRotation);

    setTimeout(() => {
      this.selectedWinner.set(this.approved()[winnerIndex]);
      this.spinning.set(false);
      this.isTransitioning.set(false);
      this.isAwarding.set(false);
    }, 3000);
  }

  concludeGame() {
    const winner = this.selectedWinner();
    if (winner) {
      this.finish.emit(winner);
    }
  }

  closeModal() {
    this.close.emit();
  }

  // Métodos visuales (sin cambios)
  getSegmentColor(i: number) { return this.colors[i % this.colors.length]; }
  getSegmentPath(i: number) {
    const seg = this.approved().length;
    const angle = 360 / seg;
    const start = i * angle, end = start + angle;
    const cx = 100, cy = 100, r = 96;
    const s = (start * Math.PI) / 180, e = (end * Math.PI) / 180;
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
    const largeArc = angle > 180 ? 1 : 0;
    return `M ${cx},${cy} L ${x1},${y1} A ${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`;
  }
  getTextX(i: number) { const seg = this.approved().length; const a = (i + 0.5) * (360 / seg) * Math.PI / 180; return 100 + 60 * Math.cos(a); }
  getTextY(i: number) { const seg = this.approved().length; const a = (i + 0.5) * (360 / seg) * Math.PI / 180; return 100 + 60 * Math.sin(a); }
  getTextTransform(i: number) {
    const seg = this.approved().length;
    const angle = i * (360 / seg) + (360 / seg) / 2;
    const x = this.getTextX(i);
    const y = this.getTextY(i);
    return `rotate(${angle + 90}, ${x}, ${y})`;
  }
}
