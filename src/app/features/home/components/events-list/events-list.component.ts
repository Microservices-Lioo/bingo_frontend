import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EStatusEventShared } from '../../../../shared/enums';
import { EventsCardComponent } from '../events-card/events-card.component';
import { HrComponent } from '../../../../shared/components/hr/hr.component';
import { EventServiceShared } from '../../../../shared/services/event.service';
import { AuthService } from '../../../auth/services';
import { IEventWithBuyer, IPagination, IPaginationQuery } from '../../../../shared/interfaces';
import { ISectionItem } from '../principal/home.component';
import { LoadingComponent } from "../../../../shared/components/loading/loading.component";
import { ToastService } from '../../../../shared/services';

@Component({
  selector: 'app-events-list',
  imports: [EventsCardComponent, HrComponent, LoadingComponent],
  templateUrl: './events-list.component.html',
  styles: ``
})
export class EventsListComponent implements OnInit {
  section!: ISectionItem;
  isSession: boolean = false;
  limit: number = 8;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private eventServ: EventServiceShared,
    private authServ: AuthService,
    private toastServ: ToastService
  ) {}

  ngOnInit() {
    const status = this.route.snapshot.paramMap.get('status') as EStatusEventShared;
    if (status === null) {
      this.router.navigate(['..'], { relativeTo: this.route });
      return;
    }
    this.authServ.isLoggedIn$.subscribe({
      next: (value) => {
        this.isSession = value;
      }
    });
    this.getEventsStatus(status, { limit: this.limit });
  } 

  // Obtener los eventos por status
  getEventsStatus(status: EStatusEventShared, pagination: IPaginationQuery) {
    this.eventServ.eventListStatus(status, pagination).subscribe({
      next: (eventList) => {
        if (eventList && eventList.data.length > 0) {
          this.setEventList(status, eventList);
        }
      },
      error: (error) => {
        console.error(error);
        this.toastServ.openToast('get-events', 'danger', 'Error al cargar los eventos');
      }
    })
  }

  // llenar las secciones
  setEventList(status: EStatusEventShared, eventList: IPagination<IEventWithBuyer>) {
    if (status === EStatusEventShared.ACTIVE) {
      if (this.section && this.section.events.data.length > 0) {
        this.section.events.data.push(...eventList.data);
        this.section.events.meta = eventList.meta;
      } else {
        this.section = { 
          title: "Ahora",
          status: status,
          events: eventList
        };
      }
    } else {
      if (this.section && this.section.events.data.length > 0) {
        this.section.events.data.push(...eventList.data);
        this.section.events.meta = eventList.meta;
      } else {
        this.section = { 
          title: "Próximos",
          status: status,
          events: eventList
        };
      }
    }
  }

  // Mostrar mas eventos
  moreEventStatus(status: EStatusEventShared) {
    const pagination = this.getPagination();
    if (!pagination) return;
    this.getEventsStatus(status, pagination);
  }

  // Obtener las paginación
  getPagination(): IPaginationQuery | null {
    let page = 1;
    page = this.section.events.meta.page + 1;
    return { limit:  this.limit, page: page };
  }

}
