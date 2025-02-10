import { Component, OnInit } from '@angular/core';
import { EventService } from '../../services/event.service';
import { EventAwardPagination } from '../../interfaces';
import { ToastService } from '../../../../shared/services/toast.service';
import { PrimaryButtonComponent } from '../../../../ui/buttons/primary-button/primary-button.component';

@Component({
  selector: 'app-principal',
  imports: [PrimaryButtonComponent],
  templateUrl: './principal.component.html',
  styles: `
  `
})
export class PrincipalComponent implements OnInit {
listEvents: EventAwardPagination | null = null;
limit = 5;
maxIndexPag = 5;

constructor(
  private eventServ: EventService,
  private toastServ: ToastService
) {}

ngOnInit() {
  this.eventServ.getEventsByUserWithAwards(this.limit, 1).subscribe({
    next: (events) => {
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


}
