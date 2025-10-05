import { Injectable, signal } from '@angular/core';

export interface Item {
  value: number;
  state: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CalledBallsService {
  private itemsSignal = signal<number[]>([]); 
  private lastItemSignal = signal(0);

  items = this.itemsSignal.asReadonly();
  lastItem = this.lastItemSignal.asReadonly();

  constructor(
  ) { }

  //* Nuevo número llamado
  setLastItem(num: number) {
    this.lastItemSignal.set(num);
  }

  //* Array de los números llamados
  setItems(items: number[]) {
    this.itemsSignal.set([...items]);
  }

  clearItems() {
    this.itemsSignal.set([]);
  }

  clearLastItem() {
    this.lastItemSignal.set(0);
  }

}
