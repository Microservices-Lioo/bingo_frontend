import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaginationInterface, PaginationQueryInterface } from '../../../../core/interfaces';
import { StatusEvent } from '../../../../shared/enums';
import { EventsCardComponent } from '../events-card/events-card.component';
import { HrComponent } from '../../../../shared/components/hr/hr.component';
import { EventServiceShared, EventWithBuyerInterface } from '../../../../shared/services/event.service';
import { AuthService } from '../../../auth/services';

@Component({
  selector: 'app-events-list',
  imports: [EventsCardComponent, HrComponent],
  templateUrl: './events-list.component.html',
  styles: ``
})
export class EventsListComponent implements OnInit {
  eventList: PaginationInterface<EventWithBuyerInterface> | undefined;
  isSession: boolean = false;
  title: string = '';
  status: StatusEvent | undefined;
  limit: number = 8;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private eventServ: EventServiceShared,
    private authServ: AuthService
  ) {}

  ngOnInit() {
    const title = this.route.snapshot.paramMap.get('title');
    const status = this.route.snapshot.paramMap.get('status');
    if (title === null || status === null) {
      this.router.navigate(['principal']);
      return;
    }
    this.status = status as StatusEvent;
    this.title = title;
    this.authServ.isLoggedIn$.subscribe({
      next: (value) => {
        this.isSession = value;
        if (value) {
          this.getEventsByUserStatus({limit: this.limit});
        } else {
          this.getEventsStatus({limit: this.limit});
        }
      }
    })
  } 

  getPagination(): PaginationQueryInterface {
    let page = 1;
    if (this.status && this.eventList) {
      page+= this.eventList.meta.page;
    }
    return { limit: this.limit, page: page };
  }

  getEventsStatus(pagination: PaginationQueryInterface) {
    if (!this.status) return;
    this.eventServ.eventListStatus(this.status, pagination).subscribe({
      next: (eventList) => {
        this.setEventList(this.status!, eventList);
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  getEventsByUserStatus(pagination: PaginationQueryInterface) {
    if (!this.status) return;
    this.eventServ.eventListByUserStatus(this.status, pagination).subscribe({
      next: (eventList) => {
        this.setEventList(this.status!, eventList);
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  setEventList(status: StatusEvent, eventList: PaginationInterface<EventWithBuyerInterface>) {
    if (this.eventList) {
      this.eventList.data = [ ...this.eventList.data, ...eventList.data ];
      this.eventList.meta = eventList.meta;
    } else {
      this.eventList = eventList;
    }
  }

  moreEventStatus() {
    const pagination = this.getPagination();
    if (!this.isSession) {
      this.getEventsStatus(pagination);
    } else {
      this.getEventsByUserStatus(pagination);
    }
  }

}
