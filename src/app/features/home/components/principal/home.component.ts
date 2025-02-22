import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/services';
import { EventServiceShared, EventWithBuyerInterface } from '../../../../shared/services/event.service';
import { StatusEvent } from '../../../../shared/enums';
import { PaginationInterface, PaginationQueryInterface } from '../../../../core/interfaces';
import { EventsCardComponent } from '../events-card/events-card.component';
import { HrComponent } from '../../../../shared/components/hr/hr.component';
import { EventsListComponent } from '../events-list/events-list.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [EventsCardComponent, RouterLink, HrComponent],
  templateUrl: './home.component.html',
  styles: ``
})
export class HomeComponent implements OnInit {
  isSession: boolean = false;
  eventListNow: PaginationInterface<EventWithBuyerInterface> | undefined;
  eventListToday: PaginationInterface<EventWithBuyerInterface> | undefined;
  eventListProgrammed: PaginationInterface<EventWithBuyerInterface> | undefined;
  limit: number = 4;
  itemsSection: { name: StatusEvent, title: string }[] = [
    { name: StatusEvent.NOW, title: 'Eventos en directo' },
    { name: StatusEvent.TODAY, title: 'Eventos de hoy' },
    { name: StatusEvent.PROGRAMMED, title: 'Próximos eventos' },
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
          this.getEventsByUserStatus(StatusEvent.NOW, {limit: this.limit});
          this.getEventsByUserStatus(StatusEvent.TODAY, {limit: this.limit});
          this.getEventsByUserStatus(StatusEvent.PROGRAMMED, {limit: this.limit});
        } else {
          this.getEventsStatus(StatusEvent.NOW, {limit: this.limit});
          this.getEventsStatus(StatusEvent.TODAY, {limit: this.limit});
          this.getEventsStatus(StatusEvent.PROGRAMMED, {limit: this.limit});
        }
      }
    })
  }

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

  getPagination(status: StatusEvent): PaginationQueryInterface {
    let page = 1;
    if (status === 'NOW' && this.eventListNow) {
      page = this.eventListNow.meta.page + 1;
    } else if (status === 'TODAY' && this.eventListToday) {
      page = this.eventListToday.meta.page + 1;
    } else {
      page = this.eventListProgrammed ? this.eventListProgrammed.meta.page + 1 : 1;
    }
    return { limit:  this.limit, page: page };
  }

  setEventList(status: StatusEvent, eventList: PaginationInterface<EventWithBuyerInterface>) {
    if (status === StatusEvent.NOW) {
      if (this.eventListNow) {
        this.eventListNow.data = [ ...this.eventListNow.data, ...eventList.data ];
        this.eventListNow.meta = eventList.meta;
      } else {
        this.eventListNow = eventList;
      }
    } else if (status === StatusEvent.TODAY) {
      if (this.eventListToday) {
        this.eventListToday.data = [ ...this.eventListToday.data, ...eventList.data ];
        this.eventListToday.meta = eventList.meta;
      } else {
        this.eventListToday = eventList;
      }
    } else {
      if (this.eventListProgrammed) {
        this.eventListProgrammed.data = [ ...this.eventListProgrammed.data, ...eventList.data ];
        this.eventListProgrammed.meta = eventList.meta;
      } else {
        this.eventListProgrammed = eventList;
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
