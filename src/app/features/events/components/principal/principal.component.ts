import { Component, OnInit } from '@angular/core';
import { EventService } from '../../services/event.service';
import { EventAwardPagination, IEventAwards } from '../../interfaces';
import { ToastService } from '../../../../shared/services/toast.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ModalService } from '../../../../shared/services/modal.service';
import { ModalInterface } from 'flowbite';
import { IAward } from '../../../award/interfaces';
import { LoadingService } from '../../../../shared/services';
import { CustomButtonComponent } from '../../../../shared/components/ui/button/custom-button.component';

@Component({
  selector: 'app-principal',
  imports: [CustomButtonComponent, IconComponent, RouterLink],
  templateUrl: './principal.component.html',
  styles: `
  `
})
export class PrincipalComponent implements OnInit {
  listEvents: EventAwardPagination | null = null;
  limit = 5;
  maxIndexPag = 5;
  modal: ModalInterface | null = null;
  eventDeleteId: string = "";
  awardsSelected: IAward[] | null = null;

  constructor(
    private eventServ: EventService,
    private toastServ: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private modalServ: ModalService,
    private loadingServ: LoadingService
  ) {}

  ngOnInit() {
    this.loadingServ.loadingOn();
    this.getEventsByUserAwards(1);
  }

  getEventsByUserAwards(page: number) {
    this.eventServ.getEventsByUserWithAwards(this.limit, page).subscribe({
      next: (events) => {
        this.listEvents = null;
        this.listEvents =  events;
        this.loadingServ.loadingOff();
      },
      error: (error) => {
        this.toastServ.openToast('get-event', 'danger', 'Error al obtener los eventos');
        this.loadingServ.loadingOff();
      }
    });
  }

  getDate(date: Date): String {
    const fecha = new Date(date);
    return fecha.toLocaleString();
  }

  prevOrNextPage(event: Event, tipo: 'next' | 'prev') {
    event.preventDefault();
    if (!this.listEvents) return;

    const page = tipo == 'next' ? this.listEvents?.meta.page + 1 : this.listEvents?.meta.page - 1
    this.getEventsByUserAwards(page);
  }

  selectPage(event: Event, page: number) {
    event.preventDefault();
    if (!this.listEvents) return;

    this.eventServ.getEventsByUserWithAwards(this.limit, page).subscribe({
      next: (events) => {
        this.listEvents = null;
        this.listEvents =  events;
      },
      error: (error) => {
        this.toastServ.openToast('get-event', 'danger', 'Error al obtener los eventos');
      }
    });
  }

  calculateRagePagination() {
    if (!this.listEvents) return;

    const { page, lastPage, total } = this.listEvents.meta;
    let inicio = 1;
    let fin = this.listEvents.meta.lastPage;

    if (lastPage > this.maxIndexPag) {
      if (page <= 2) {
        fin = this.maxIndexPag;
      } else if(page >= total -1) {
        inicio = total - (this.maxIndexPag -1);
      } else {
        inicio = page - 1;
        fin = page + 1;
      }
    }

    const paginas = [];

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }

    return paginas;
  }

  // Ir a Componente de editar un evento
  editEvent(eventAward: IEventAwards) {
    const { award, ...event } = eventAward;
    this.eventServ.sendSeleted(event);
    this.router.navigate(["./edit"], { relativeTo: this.route });
  }

  deleteEvent(id: string) {
    const modal = this.modalServ.createModal('delete-event-modal');
    this.modalServ.openModal(modal);
    this.modal = modal;
    this.eventDeleteId = id;
  }

  modalClose() {
    if (!this.modal) return;
    this.modalServ.closeModal(this.modal);
    this.modal = null;
    this.awardsSelected = null;
  }

  modalAccept() {
    if (!this.modal) return;
    this.eventServ.deleteEvent(this.eventDeleteId).subscribe({
      next: (_) => {
        this.getEventsByUserAwards(1);
        this.toastServ.openToast('delete-event', 'success', `Evento con id #${this.eventDeleteId} eliminado`);
        this.eventDeleteId = "";
        this.modalClose();
      },
      error: (error) => {
        this.toastServ.openToast('delete-event', 'danger', `${error.message}`)
        this.modalServ.closeModal(this.modal!);
      }
    })
  }

  viewAwards(awards: IAward[]) {
    this.awardsSelected = awards;
    const modal = this.modalServ.createModal('view-award-modal');
    this.modal = modal;
    this.modalServ.openModal(modal);
  }
}
