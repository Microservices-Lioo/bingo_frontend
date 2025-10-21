import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { ICardShared, ITableWinners } from '../../../../shared/interfaces';
import { IGameMode, INumberHistory } from '../../interfaces';
import { EStatusTableBingoShared } from '../../../../shared/enums';

// Interface extendida para el modal (combina ganador + detalles)
export interface IWinnerValidationData {
  winner: ITableWinners;
  card: ICardShared;
  gameMode: IGameMode;
  numberHistory: INumberHistory;
}

@Component({
  selector: 'app-validate-bingo-modal',
  imports: [CommonModule],
  templateUrl: './validate-bingo-modal.component.html',
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out;
    }
    
    .animate-slideUp {
      animation: slideUp 0.3s ease-out;
    }
  `]
})
export class ValidateBingoModalComponent {
   // Inputs
  isOpen = input.required<boolean>();
  validationData = input<IWinnerValidationData | null>(null);

  // Outputs
  close = output<void>();
  accept = output<ITableWinners>(); // Emite el userId
  reject = output<ITableWinners>(); // Emite el userId

  // Constants
  cardLetters = ['B', 'I', 'N', 'G', 'O'];

  // Computed properties
  sortedNumbers = computed(() => {
    const nums = this.validationData()?.numberHistory.nums || [];
    return [...nums].sort((a, b) => a - b);
  });

  markedCount = computed(() => {
    const card = this.validationData()?.card;
    if (!card) return 0;
    return card.nums.flat().filter(cell => cell.marked).length;
  });

  totalCells = computed(() => {
    const card = this.validationData()?.card;
    if (!card) return 0;
    return card.nums.flat().length;
  });

  hasInvalidMarks = computed(() => {
    const data = this.validationData();
    if (!data) return false;
    
    return data.card.nums.flat().some(cell => 
      cell.marked && !this.isNumberInHistory(cell.num)
    );
  });

  isNumberInHistory(num: number): boolean {
    return this.validationData()?.numberHistory.nums.includes(num) || false;
  }

  getPatternCell(position: string): { required: boolean; label: string } | null {
    const allPositions = this.generateAllPositions();
    const index = allPositions.indexOf(position);
    
    if (index === -1) return null;
    
    const row = Math.floor(index / 5);
    const col = index % 5;
    const required = this.validationData()?.gameMode.rule.includes(position) || false;
    
    // Centro es estrella
    if (row === 2 && col === 2) {
      return { required, label: '★' };
    }
    
    return { required, label: required ? '✓' : '' };
  }

  private generateAllPositions(): string[] {
    const positions: string[] = [];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        positions.push(`${row}-${col}`);
      }
    }
    return positions;
  }

  getStatusClass(status: EStatusTableBingoShared): string {
    const classes = {
      [EStatusTableBingoShared.PENDIENTE]: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      [EStatusTableBingoShared.APROBADO]: 'bg-green-100 text-green-800 border border-green-300',
      [EStatusTableBingoShared.RECHAZADO]: 'bg-red-100 text-red-800 border border-red-300'
    };
    return classes[status] || '';
  }

  getStatusLabel(status: EStatusTableBingoShared): string {
    const labels = {
      [EStatusTableBingoShared.PENDIENTE]: 'Pendiente',
      [EStatusTableBingoShared.APROBADO]: '✓ Verificado',
      [EStatusTableBingoShared.RECHAZADO]: '✗ Rechazado'
    };
    return labels[status] || status;
  }

  closeModal(): void {
    this.close.emit();
  }

  handleAccept(): void {
    const data = this.validationData();
    if (data && !this.validationMode()) {
      this.accept.emit(data.winner);
    }
  }

  handleReject(): void {
    const data = this.validationData();
    if (data) {
      this.reject.emit(data.winner);
    }
  }

  validationMode() {
    const data = this.validationData();
    if (!data) return false;

    return data.gameMode.rule.some(position => {
      const [row, col] = position.split(':').map(Number);
      return !data.card.nums[row][col]?.marked;
    });
  }
}
