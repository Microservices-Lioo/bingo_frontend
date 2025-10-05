import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/services';
import { EventServiceShared, } from '../../../../shared/services/event.service';
import { EStatusEventShared } from '../../../../shared/enums';
import { EventsCardComponent } from '../events-card/events-card.component';
import { IEventWithBuyer, IPagination, IPaginationQuery } from '../../../../shared/interfaces';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { HrComponent } from "../../../../shared/components/hr/hr.component";
import { LoadingService, ToastService } from '../../../../shared/services';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { finalize, map, switchMap } from 'rxjs';

export interface ISectionItem {
  title: string;
  status: EStatusEventShared;
  events: IPagination<IEventWithBuyer>
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [EventsCardComponent, RouterLink, LoadingComponent, HrComponent, LoadingIndicatorComponent],
  templateUrl: './home.component.html',
  styles: ``
})
export class HomeComponent implements OnInit {
  isSession: boolean = false;
  limit: number = 4;
  itemsSection: ISectionItem[] = [];

  constructor(
    private authServ: AuthService,
    private eventServ: EventServiceShared,
    private router: Router,
    private route: ActivatedRoute,
    private toastServ: ToastService,
    protected loadingServ: LoadingService
  ) {}

  ngOnInit() {
    this.authServ.isLoggedIn$.subscribe({
      next: (value) => {
        this.isSession = value;
      }
    });
    this.initSection();
  }

  initSection() {
    this.loadingServ.on();
    this.eventServ.eventListStatus(EStatusEventShared.ACTIVE, { limit: this.limit })
    .pipe(
      switchMap( 
        eventActive => 
          this.eventServ.eventListStatus(EStatusEventShared.PENDING, { limit: this.limit })
          .pipe( map( eventPending => ({ eventActive, eventPending })))
      ),
      finalize(() => this.loadingServ.off())    
    ).subscribe({
      next: ({eventActive, eventPending}) => {
        if (eventActive && eventActive.data.length > 0) {
          this.setEventList(EStatusEventShared.ACTIVE, eventActive);
        }
        
        if (eventPending && eventPending.data.length > 0) {
          this.setEventList(EStatusEventShared.PENDING, eventPending);
        }
      },
      error: (error) => {
        console.error(error);
        this.toastServ.openToast('get-events', 'danger', 'Error al cargar los eventos');
      }
    })
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

  // Obtener las paginación
  getPagination(status: EStatusEventShared): IPaginationQuery | null {
    let page = 1;
    const section = this.itemsSection.find(item => item.status === status);
    if (!section) return null;
    page = section.events.meta.page + 1;
    return { limit:  this.limit, page: page };
  }

  // llenar las secciones
  setEventList(status: EStatusEventShared, eventList: IPagination<IEventWithBuyer>) {
    if (status === EStatusEventShared.ACTIVE) {
      if (this.itemsSection.length > 0) {
        const index = this.itemsSection.findIndex(item => item.status === status);
        if (index !== -1) {
          this.itemsSection[index].events.data.push(...eventList.data);
          this.itemsSection[index].events.meta = eventList.meta;
        } else {
          this.itemsSection.push({ 
            title: "Ahora",
            status: status,
            events: eventList
          });
        }
      } else {
        this.itemsSection.push({ 
          title: "Ahora",
          status: status,
          events: eventList
        });
      }
    } else {
      if (this.itemsSection.length > 0) {
        const index = this.itemsSection.findIndex(item => item.status === status);
        if (index !== -1) {
          this.itemsSection[index].events.data.push(...eventList.data);
          this.itemsSection[index].events.meta = eventList.meta;
        } else {
          this.itemsSection.push({ 
            title: "Próximos",
            status: status,
            events: eventList
          });
        }
      } else {
        this.itemsSection.push({ 
          title: "Próximos",
          status: status,
          events: eventList
        });
      }
    }
  }

  // Mostrar mas eventos
  moreEventStatus(status: EStatusEventShared) {
    const pagination = this.getPagination(status);
    if (!pagination) return;
    this.getEventsStatus(status, pagination);
  }

  // Mostrar todos los eventos
  allEventStatus(status: EStatusEventShared) {
    this.router.navigate(['../all-events', { status }], { relativeTo: this.route });
  }
  
}
