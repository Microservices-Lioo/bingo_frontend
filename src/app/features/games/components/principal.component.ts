import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventServiceShared } from '../../../shared/services';
import { EventAwardsInterface } from '../../../core/interfaces';
import { BallStatusComponent } from './ball-status/ball-status.component';
import { initFlowbite } from 'flowbite';
import { GamesService } from '../services/games.service';

@Component({
  selector: 'app-principal',
  imports: [BallStatusComponent],
  templateUrl: './principal.component.html',
  styles: `
  .cell {
    padding: 0px;
    margin: 0px;
    font-size: 7px; 
  }  
  `
})
export class PrincipalComponent implements OnInit {
  loadingBtnAnimated = false;
  eventData!: EventAwardsInterface;
  matrixMode: boolean[][] = [
    [true, false, false, false, true],
    [true, true, false, false, true],
    [true, false, true, false, true],
    [true, false, false, true, true],
    [true, false, false, false, true],
  ];
  numCalled: number | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private eventSharedServ: EventServiceShared,
    private gameServ: GamesService
  ) {
  }

  ngOnInit() {
    const eventId = this.route.snapshot.paramMap.get('id');
    const userId = this.route.snapshot.paramMap.get('userId');
    this.getEvent(+eventId!, +userId!);
    // this.calledBall(5);
    // this.cleanBalls(true);
    initFlowbite();
  }

  getEvent(eventId: number, userId: number) {
    this.eventSharedServ.getEventWithAwards(+eventId, userId).subscribe({
      next: (event) => {
        this.eventData = event;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  calledBall(ball: number) {
    this.gameServ.sendBall(ball);
  }

  cleanBalls(val: boolean) {
    this.gameServ.cleanBalls(val);
  }

}
