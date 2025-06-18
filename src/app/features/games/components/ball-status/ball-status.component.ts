import { Component, Input } from '@angular/core';
import { BehaviorSubject, Subject, take, takeUntil } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { GamesService } from '../../services/games.service';

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
  items: { value: number; state: boolean; }[];
  num_cantado: number = 0;
  
  private destroyCalledBall$ = new Subject<void>();
  private destroyCleanBall$ = new Subject<void>();

  constructor(
    private readonly gamesServ: GamesService
  ) {
    this.items = Array.from({ length: 75 }, (_, i) => ({
      value: i + 1,
      state: false
    }));

    this.gamesServ.calledball$
    .pipe(takeUntil(this.destroyCalledBall$))
    .subscribe(num => {
      if (num == 0 ) return;
      this.selectedBall(num)
    });

    this.gamesServ.cleanBoardBalls$
    .pipe(takeUntil(this.destroyCleanBall$))
    .subscribe(val => {
      this.cleanBalls(val)
    });
  }

  selectedBall(num: number) {
    if (num == 0 ) return;
    const index = num - 1;
    
    if (this.items[index].value != num) return;
    if (!this.items[index].state) {
      this.items[index].state = true;
    };
  }

  cleanBalls(val: boolean) {
    if (!val) return;
    this.items = [];
    this.items = Array.from({ length: 75 }, (_, i) => ({
      value: i + 1,
      state: false
    }));
  }

  ngOnDestroy() {
    this.destroyCalledBall$.next();
    this.destroyCalledBall$.complete();
    this.destroyCleanBall$.next();
    this.destroyCleanBall$.complete();
  }
}
