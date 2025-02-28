import {  RouterLink } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { EventServiceShared } from '../../../../shared/services/event.service';
import { EventInterface, PaginationInterface, PaginationQueryInterface } from '../../../../core/interfaces';
import { initFlowbite, TooltipInterface } from 'flowbite';
import { TooltipComponent } from '../../../../shared/components/tooltip/tooltip.component';
import { TooltipsService } from '../../../../shared/services/tooltips.service';
import { AuthService } from '../../../auth/services';
import { StatusEvent } from '../../../../shared/enums';
import { HrComponent } from '../../../../shared/components/hr/hr.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, TooltipComponent, HrComponent],
  templateUrl: './sidebar.component.html',
  styles: `
    .bg-sidebar {
      background: var(--bg-primary-color);
    }
  `
})
export class SidebarComponent implements OnInit {
  isSession: boolean = false;
  eventListNow: PaginationInterface<EventInterface> | undefined;
  eventListToday: PaginationInterface<EventInterface> | undefined;
  toolTip: TooltipInterface | null = null;
  limit: number = 3;

  constructor(
    private authServ: AuthService,
    private eventServ: EventServiceShared,
    private toolTipServ: TooltipsService,
  ) { }

  ngOnInit() {
    this.authServ.isLoggedIn$.subscribe({
      next: (value) => {
        this.isSession = value;
        const pagination = { limit: this.limit };
        const paginationToday = { limit: this.limit };
        this.resetValues();
        if (!value) {
          this.getEventsStatus(StatusEvent.NOW, pagination);
          this.getEventsStatus(StatusEvent.TODAY, paginationToday);
        } else {
          this.getEventsByUserStatus(StatusEvent.NOW, pagination);
          this.getEventsByUserStatus(StatusEvent.TODAY, paginationToday);
        }
      },
    });
    initFlowbite();
  }

  resetValues() {
    this.eventListNow = undefined;
    this.eventListToday = undefined;
  }

  viewToolTip(id: number) {
    if (this.toolTip) {
      this.toolTip = null;
    }
    const tool = this.toolTipServ.createToolTip('tooltip-' + id, 'tooltip-ctx' + id);
    if (!tool) return;
    this.toolTip = tool;
  }

  showMore() {
    if (!this.eventListNow) return;
    if (this.eventListNow && this.eventListNow.meta.page === this.eventListNow.meta.lastPage) return;
    
    const page = this.eventListNow.meta.page + 1;
    const pagination = { limit: this.limit, page: page };
    if (!this.isSession) {
      this.getEventsStatus(StatusEvent.NOW, pagination);
      this.eventListNow.meta.page = + 1;
    } else {
      this.getEventsByUserStatus(StatusEvent.NOW, pagination);
      this.eventListNow.meta.page = + 1;
    }
  }

  showLess() {    
    if (!this.eventListNow) return;
    if (this.eventListNow && this.eventListNow.meta.page === 1) return;

    this.eventListNow.meta.page = this.eventListNow.meta.page - 1;    
    const init = 0;
    const end = this.limit * this.eventListNow.meta.page;
    const events = this.eventListNow.data.slice(init, end);
    this.eventListNow.data = [];
    this.eventListNow.data = events;
  }

  showMoreToday() {
    if (!this.eventListToday) return;
    if (this.eventListToday && this.eventListToday.meta.page === this.eventListToday.meta.lastPage) return;
    
    const page = this.eventListToday.meta.page + 1;
    const pagination = { limit: this.limit, page: page };
    if (!this.isSession) {
      this.getEventsStatus(StatusEvent.TODAY, pagination);
      this.eventListToday.meta.page = + 1;
    } else {
      this.getEventsByUserStatus(StatusEvent.TODAY, pagination);
      this.eventListToday.meta.page = + 1;
    }
  }

  showLessToday() {
    if (!this.eventListToday) return;
    if (this.eventListToday && this.eventListToday.meta.page === 1) return;

    this.eventListToday.meta.page = this.eventListToday.meta.page - 1;
    const init = 0;
    const end = this.limit * this.eventListToday.meta.page;
    const events = this.eventListToday.data.slice(init, end);
    this.eventListToday.data = [];
    this.eventListToday.data = events;
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

  setEventList(status: StatusEvent, eventList: PaginationInterface<EventInterface>) {
    if (status === StatusEvent.NOW) {
      if (this.eventListNow) {
        this.eventListNow.data = [...this.eventListNow.data, ...eventList.data];
        this.eventListNow.meta = eventList.meta;
      } else {
        this.eventListNow = eventList;
      }
    } else if (status === StatusEvent.TODAY) {
      if (this.eventListToday) {
        this.eventListToday.data = [...this.eventListToday.data, ...eventList.data];
        this.eventListToday.meta = eventList.meta;
      } else {
        this.eventListToday = eventList;
      }
    }
  }

}
