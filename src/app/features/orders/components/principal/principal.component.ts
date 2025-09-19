import { Component, OnInit } from '@angular/core';
import { LoadingService, ToastService } from '../../../../shared/services';
import { LoadingIndicatorComponent } from "../../../../shared/components/loading-indicator/loading-indicator.component";
import { IOrderPagination } from '../../interfaces';
import { OrderService } from '../../services/order.service';
import { CommonModule } from '@angular/common';
import { IconComponent } from "../../../../shared/components/icon/icon.component";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-principal',
  imports: [LoadingIndicatorComponent, CommonModule, IconComponent, RouterLink],
  templateUrl: './principal.component.html',
  styles: ``
})
export class PrincipalComponent implements OnInit {
  orders!: IOrderPagination;
  pagination = {
    limit: 5,
    page: 1
  }

  constructor(
    protected loadingServ: LoadingService,
    private orderServ: OrderService,
    private toastServ: ToastService,
  ) {}

  ngOnInit() {
    this.getOrders(1);
  }

  // Obtener las ordenes paginadas
  getOrders(page: number) {
    this.loadingServ.on();
    this.pagination.page = page;
    this.orderServ.getOrders(this.pagination).subscribe({
      next: (orders) => {
        this.orders = orders;
      },
      error: (error) => {
        console.error(error);
        this.toastServ.openToast('get-orders', 'danger', error.message);
        this.loadingServ.off();
      },
      complete: () => this.loadingServ.off(),
    })
  }

  // Regresar o avanzar a la siguiente paginación
  prevOrNextPage(event: Event, tipo: 'next' | 'prev') {
    event.preventDefault();
    if (!this.orders) return;

    const page = tipo == 'next' ? this.orders.meta.page + 1 : this.orders.meta.page - 1;
    this.getOrders(page);
  }

  // Calcular el rango  de paginación
  calculateRagePagination() {
    if (!this.orders) return;

    const { page, lastPage, total } = this.orders.meta;
    let inicio = 1;
    let fin = this.orders.meta.lastPage;

    if (lastPage > this.pagination.page) {
      if (page <= 2) {
        fin = this.pagination.page;
      } else if(page >= total -1) {
        inicio = total - (this.pagination.page -1);
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

  // Navegar a la pagina seleccionada directamente
  selectPage(event: Event, page: number) {
    event.preventDefault();
    if (!this.orders) return;
    this.getOrders(page);
  }
}
