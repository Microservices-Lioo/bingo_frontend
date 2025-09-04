import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/services';
import { EventServiceShared, } from '../../../../shared/services/event.service';
import { StatusEvent } from '../../../../shared/enums';
import { IPagination, PaginationQueryInterface } from '../../../../core/interfaces';
import { EventsCardComponent } from '../events-card/events-card.component';
import { HrComponent } from '../../../../shared/components/hr/hr.component';
import { IEventWithBuyer } from '../../../../shared/interfaces';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [EventsCardComponent, RouterLink, HrComponent],
  templateUrl: './home.component.html',
  styles: ``
})
export class HomeComponent implements OnInit {
  isSession: boolean = false;
  eventListActive: IPagination<IEventWithBuyer> | undefined;
  eventListToday: IPagination<IEventWithBuyer> | undefined;
  eventListPending: IPagination<IEventWithBuyer> | undefined;
  limit: number = 4;
  itemsSection: { name: StatusEvent, title: string }[] = [
    { name: StatusEvent.ACTIVE, title: 'Eventos en directo' },
    { name: StatusEvent.PENDING, title: 'Próximos eventos' },
  ];

  constructor(
    private authServ: AuthService,
    private eventServ: EventServiceShared,
    private router: Router
  ) {}

  ngOnInit() {
    this.authServ.isLoggedIn$.subscribe({
      next: (value) => {
        this.isSession = value;
        if (value) {
          this.getEventsByUserStatus(StatusEvent.ACTIVE, {limit: this.limit});
          this.getEventsByUserStatus(StatusEvent.PENDING, {limit: this.limit});
        } else {
          this.getEventsStatus(StatusEvent.ACTIVE, {limit: this.limit});
          this.getEventsStatus(StatusEvent.PENDING, {limit: this.limit});
        }
      }
    })
  }

  // Obtener los eventos por status
  getEventsStatus(status: StatusEvent, pagination: PaginationQueryInterface) {
    this.eventServ.eventListStatus(status, pagination).subscribe({
      next: (eventList) => {
        this.setEventList(status, eventList);
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  // Obtener los eventos de un usuario por status
  getEventsByUserStatus(status: StatusEvent, pagination: PaginationQueryInterface) {
    this.eventServ.eventListByUserStatus(status, pagination).subscribe({
      next: (eventList) => {
        this.setEventList(status, eventList);
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  // Obtener las paginación
  getPagination(status: StatusEvent): PaginationQueryInterface {
    let page = 1;
    if (status === 'ACTIVE' && this.eventListActive) {
      page = this.eventListActive.meta.page + 1;
    }else {
      page = this.eventListPending ? this.eventListPending.meta.page + 1 : 1;
    }
    return { limit:  this.limit, page: page };
  }

  // 
  setEventList(status: StatusEvent, eventList: IPagination<IEventWithBuyer>) {
    if (status === StatusEvent.ACTIVE) {
      if (this.eventListActive) {
        this.eventListActive.data = [ ...this.eventListActive.data, ...eventList.data ];
        this.eventListActive.meta = eventList.meta;
      } else {
        this.eventListActive = eventList;
      }
    } else {
      if (this.eventListPending) {
        this.eventListPending.data = [ ...this.eventListPending.data, ...eventList.data ];
        this.eventListPending.meta = eventList.meta;
      } else {
        this.eventListPending = eventList;
      }
    }
  }

  moreEventStatus(status: StatusEvent) {
    const pagination = this.getPagination(status);
    if (!this.isSession) {
      this.getEventsStatus(status, pagination);
    } else {
      this.getEventsByUserStatus(status, pagination);
    }
  }

  allEventStatus(title: string, status: StatusEvent) {
    this.router.navigate(['/home/all-events', { title: title, status: status }]);
  }
  
}
