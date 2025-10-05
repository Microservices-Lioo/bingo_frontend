import { Component, effect, OnInit } from '@angular/core';
import { CalledBallsService } from '../../services/called-balls.service';

export interface Item {
  value: number;
  state: boolean;
}

@Component({
  selector: 'app-ball-status',
  templateUrl: './ball-status.component.html',
  styles: `
  .loader {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      position: relative;
      box-shadow: 0 0 5px 1px #14294a inset,
          0 1px 1px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      font-size: 75%;
    }
    .loader-status {
      border-radius: 50%;
      position: relative;
      overflow: hidden;
      color: white;
    }
  `
})
export class BallStatusComponent {
  items: Item[];
  lastNumberSung: string = '';
  

  constructor(
    private readonly calledBallsServ: CalledBallsService
  ) {
    this.items = this.generateNumbers;

    effect(() => {
      const items = this.calledBallsServ.items();
      this.setItems(items);

      const item = this.calledBallsServ.lastItem();
      this.setLastItem(item);
    })
  }

  // marcar los numeros obtenidos
  setItems(item: number[]) {
    if (item.length === 0) {
      this.items = this.generateNumbers;
      this.lastNumberSung = '';
      return;
    }

    const newItems = this.items.map( val => item.includes(val.value) ? { ...val, state: true} : val );
    this.items = [...newItems];
  }

  // Ultimo número cantado
  setLastItem(num: number) {
    const INTERVAL = 15;
    const COL_NAMES = ['B', 'I', 'N', 'G', 'O']
    
    if (num === 0 || num === undefined) return;
    const index = Math.ceil(num / INTERVAL) - 1;
    this.lastNumberSung = `${COL_NAMES[index]} - ${num}`;

    const newItem = this.items.map(val => val.value === num ? { ...val, state: true } : val );
    this.items = [...newItem];
  }

  get generateNumbers() {
    return  Array.from({ length: 75 }, (_, i) => ({
      value: i + 1,
      state: false
    }));
  }
}
