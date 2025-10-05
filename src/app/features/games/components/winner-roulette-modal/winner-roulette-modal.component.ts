import { Component, input, output, signal } from '@angular/core';
import { EStatusTableBingoShared } from '../../../../shared/enums';
import { IAwardShared, ITableWinners } from '../../../../shared/interfaces';
import { CustomButtonComponent } from "../../../../shared/components/ui/button/custom-button.component";
import { LoadingComponent } from "../../../../shared/components/loading/loading.component";

@Component({
  selector: 'app-winner-roulette-modal',
  imports: [CustomButtonComponent, LoadingComponent],
  templateUrl: './winner-roulette-modal.component.html',
  styles: ``
})
export class WinnerRouletteModalComponent {
  // Inputs
  isOpen = input.required<boolean>();
  winners = input.required<ITableWinners[]>(); // lista de todos los jugadores
  award = input.required<IAwardShared>(); // lista de todos los jugadores
  isAdmin = input<boolean>(false); // Administrador
  isLoading = input<boolean>(false); // Indicador de culminación

  // Outputs
  close = output<void>();
  finish = output<ITableWinners>(); // emite el ganador final

  // Estados internos
  rotation = signal(0);
  spinning = signal(false);
  selectedWinner = signal<ITableWinners | null>(null);

  // Solo los aprobados
  approved = () => this.winners().filter(w => w.status === EStatusTableBingoShared.APROBADO);

  // Inicia el sorteo
  startSpin(): void {
    if (this.spinning() || this.approved().length === 0) return;

    this.spinning.set(true);

    const randomIndex = Math.floor(Math.random() * this.approved().length);
    const winner = this.approved()[randomIndex];

    // Giramos varias vueltas + ángulo específico
    const segmentAngle = 360 / this.approved().length;
    const targetRotation = 360 * 5 + (360 - (randomIndex * segmentAngle + segmentAngle / 2));

    this.rotation.set(targetRotation);

    setTimeout(() => {
      this.spinning.set(false);
      this.selectedWinner.set(winner);
    }, 3200); // coincide con el transition duration
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
    this.close.emit();
  }
}
