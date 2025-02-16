import { Component, OnInit } from '@angular/core';
import { EventService } from '../../services/event.service';
import { EventAwardPagination, EventAwardsInterface, EventInterface } from '../../interfaces';
import { ToastService } from '../../../../shared/services/toast.service';
import { PrimaryButtonComponent } from '../../../../ui/buttons/primary-button/primary-button.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { Router, RouterLink } from '@angular/router';
import { ModalService } from '../../../../shared/services/modal.service';
import { ModalInterface } from 'flowbite';
import { AwardInterface } from '../../../award/interfaces';
import { ListViewComponent } from '../../../award/components/list-view/list-view.component';

@Component({
  selector: 'app-principal',
  imports: [PrimaryButtonComponent, IconComponent, ListViewComponent, RouterLink],
  templateUrl: './principal.component.html',
  styles: `
  `
})
export class PrincipalComponent implements OnInit {
  listEvents: EventAwardPagination | null = null;
  limit = 5;
  maxIndexPag = 5;
  modal: ModalInterface | null = null;
  eventDeleteId: number = 0;
  awardsSelected: AwardInterface[] | null = null;

  constructor(
    private eventServ: EventService,
    private toastServ: ToastService,
    private router: Router,
    private modalServ: ModalService
  ) {}

  ngOnInit() {
    this.getEventsByUserAwards(1);
  }

  getEventsByUserAwards(page: number) {
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

  editEvent(eventAward: EventAwardsInterface) {
    const { award, ...event } = eventAward;
    this.router.navigate(['events', 'edit'], { state: { event } })
  }

  deleteEvent(id: number) {
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
        this.eventDeleteId = 0;
        this.modalClose();
      },
      error: (error) => {
        this.toastServ.openToast('delete-event', 'danger', `${error.message}`)
        this.modalServ.closeModal(this.modal!);
      }
    })
  }

  viewAwards(awards: AwardInterface[]) {
    this.awardsSelected = awards;
    const modal = this.modalServ.createModal('view-award-modal');
    this.modal = modal;
    this.modalServ.openModal(modal);
  }
}
