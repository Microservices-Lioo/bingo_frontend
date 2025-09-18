import { Component, OnInit } from '@angular/core';
import { IOrder, IOrderWItems } from '../../interfaces';
import { EStatusOrder } from '../../enums';
import { LoadingService, ToastService } from '../../../../shared/services';
import { LoadingIndicatorComponent } from "../../../../shared/components/loading-indicator/loading-indicator.component";
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-detail',
  imports: [LoadingIndicatorComponent, CommonModule],
  templateUrl: './detail.component.html',
  styles: ``
})
export class DetailComponent implements OnInit {
  order!: IOrderWItems;

  constructor(
    protected loadingServ: LoadingService,
    private orderServ: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private toastServ: ToastService,
  ) {}

  ngOnInit() {
    this.loadingServ.on();
    const orderId = this.route.snapshot.paramMap.get('id');

    if (!orderId) {
      this.router.navigate(['..'], { relativeTo: this.route });
      this.toastServ.openToast('param-id', 'warning', 'No se encontro el parametro');
      return;
    }

    this.orderServ.getOrderById(orderId).subscribe({
      next: (value) => {
        this.order = value;
      },
      error: (error) => {
        console.error(error);
        this.toastServ.openToast('get-order', 'danger', error.message);
        this.loadingServ.off();
      },
      complete: () => this.loadingServ.off()
    })
  }
}

