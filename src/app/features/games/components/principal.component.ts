import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventServiceShared } from '../../../shared/services';
import { EventAwardsInterface } from '../../../core/interfaces';
import { BallStatusComponent } from './ball-status/ball-status.component';
import { initFlowbite } from 'flowbite';
import { GamesService } from '../services/games.service';



type AwardType = {
  num: number;
  name: string;
  winner: string;
  winner_status: boolean;
  status: boolean;
};

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
  awardsList: AwardType[];

  constructor(
    private route: ActivatedRoute,
    private eventSharedServ: EventServiceShared,
    private gameServ: GamesService
  ) {
    this.awardsList = this.getAwardsList();
  }

  ngOnInit() {
    const eventId = this.route.snapshot.paramMap.get('id');
    const userId = this.route.snapshot.paramMap.get('userId');
    this.getEvent(+eventId!, +userId!);

    // this.calledBall(5);
    // this.cleanBalls(true);
    initFlowbite();
  }

  getAwardsList(): AwardType[] {
    let awards = [
      { num: 1, name: 'Premio 1', winner: 'Kevin', winner_status: true, status: false },
      { num: 2, name: 'Premio 2', winner: '', winner_status: false, status: true },
      { num: 3, name: 'Premio 3', winner: '', winner_status: false, status: false },
      { num: 4, name: 'Premio 4', winner: '', winner_status: false, status: false },
      { num: 5, name: 'Premio 5', winner: '', winner_status: false, status: false},
      { num: 6, name: 'Premio 6', winner: '', winner_status: false, status: false },
    ];

    return this.orderAwards(awards);
  }

  orderAwards(awards: AwardType[]) {    
    let auxActualxList: AwardType;
    let auxFinList: AwardType[] = [];
    let auxProxList: AwardType[] = [];

    awards.forEach(element => {
      if (element.status) {
        auxActualxList = element;
      } else if (element.winner_status) {
        auxFinList.push(element);
      } else {
        auxProxList.push(element);
      }
    });
    let awardsResult = [auxActualxList!, ...auxProxList.concat(...auxFinList)];
    return awardsResult;
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
