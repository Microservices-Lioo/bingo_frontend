import { Component, effect, inject } from '@angular/core';
import { IEventAwards } from '../../../events/interfaces';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../events/services/event.service';
import { CardsServiceShared, LoadingService, ToastService } from '../../../../shared/services';
import { UserService } from '../../../profile/services';
import { PrimaryButtonComponent } from '../../../../ui/buttons/primary-button/primary-button.component';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomInputComponent } from '../../../../ui/inputs/custom-input/custom-input.component';
import { OrderService } from '../../services/order.service';
import { CreateOrderInterface } from '../../interfaces';

export interface ItemForm {
  quantity: FormControl<number>
}

@Component({
  selector: 'app-order-form',
  imports: [CommonModule, IconComponent, PrimaryButtonComponent, 
    ReactiveFormsModule, CustomInputComponent],
  templateUrl: './order-form.component.html',
  styles: ``
})
export class OrderFormComponent {
  infoEventAward: IEventAwards | null = null;
  owner = 'Desconocido';
  letterOwner = '';
  cantCard = 0;

  fb = inject(NonNullableFormBuilder);
StatusEvent: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private eventServ: EventService,
    private toastServ: ToastService,
    private userServ: UserService,
    private loadingServ: LoadingService,
    private orderServ: OrderService,
    private cardsServ: CardsServiceShared
  ) {
    effect(() => {
      const query = new URLSearchParams(window.location.search);
      if (query.get("success")) {
        this.toastServ.openToast('order-success', 'success', "Pedido realizado - Recibirá una confirmación por correo electrónico.");
        this.loadingServ.loadingOff();
      }
  
      if (query.get("canceled")) {
        this.toastServ.openToast(
          'order-danger', 'danger', 
          "Petido cancelado"
        );
        this.loadingServ.loadingOff();
      }
    })
  }

  createCard: FormGroup<ItemForm> = this.fb.group<ItemForm>({
    quantity: this.fb.control(1, { validators: [Validators.required, Validators.min(1)]})
  });

  ngOnInit() {
    this.loadingServ.loadingOn();
    if (!this.infoEventAward) {
      this.route.paramMap.subscribe(value => {
        const eventId = value.get('id');
        if (eventId) {
          this.getEventAward(eventId);
          this.getCountCards(eventId);
          
        } else {
          this.router.navigate(['/', '/home/principal']);
          this.loadingServ.loadingOff();
        }
      });
    } else {
      this.loadingServ.loadingOff();
    }    
  }

  getEventAward(eventId: string) {
    this.eventServ.getEventWithAwards(eventId).subscribe({
      next: (event) => {
        if (!event) {
          this.loadingServ.loadingOff();
          return;
        }
        this.infoEventAward = event;
        // this.getOwner(event.userId);
        this.loadingServ.loadingOff();
      },
      error: (error) => {
        this.router.navigate(['/', '/home/principal']);
        this.loadingServ.loadingOff();
      }
    })
  }

  getUser(userId: string) {
    return this.userServ.getUser(userId);
  }

  getOwner(userId: string): string {
    let ownerName = 'Desconocido';
    this.getUser(userId).subscribe({
      next: (user) => {
        if (user) {
          const { name, lastname, ...data } = user;
          const username = name + ' ' + lastname;
          this.owner = username != this.owner ? username : this.owner;
          ownerName = this.owner;
          this.getLetter();
        }
      },
      error: (error) => {
        return ownerName;
      }
    });
    return ownerName;
  }

  getLetter() {
    let letter = '';
    const arrayOwner = this.owner.split(' ');
    if (arrayOwner.length > 2 ) {
      arrayOwner.forEach((name, index) => {
        if (index === 0 || index === 2 ) {
          const arrayLetter = name.split('');
          letter = letter + arrayLetter[0];
        }
      });
    } else {
      arrayOwner.forEach(name => {
        const arrayLetter = name.split('');
        letter = letter + arrayLetter[0];
      });
    }
    this.letterOwner = letter;
  }

  toggleText(event: Event, id: string) {
    const pElement = document.getElementById(id);
    if (pElement) {
      pElement.classList.toggle('truncate');
    }
  }

  more() {
    const quanlity = this.createCard.controls.quantity.value;
    this.createCard.controls.quantity.setValue(quanlity - 1);
  }

  less() {
    const quanlity = this.createCard.controls.quantity.value;
    this.createCard.controls.quantity.setValue(quanlity + 1);
  }

  buy() {
    this.loadingServ.loadingOn();

    if (this.createCard.invalid) {
      this.toastServ.openToast('invalid-form', 'danger', 'Formulario invalido.');
      this.loadingServ.loadingOff();
    } else {
      if (this.infoEventAward === null) {
        this.toastServ.openToast('event-data', 'danger', 'No se encontró la información del evento.')
        this.loadingServ.loadingOff();
      } else {
        const quantity = this.createCard.value.quantity;
        if (!quantity) {
          this.toastServ.openToast('quantity-data', 'danger', 'No se especificó la cantidad de elemntos a comprar para este evento.')
          this.loadingServ.loadingOff();
      } else {
          // const orderEvent: CreateOrderInterface = { totalItems: quantity, eventId: this.infoEventAward.id, nameEvent: this.infoEventAward.name, unitAmount: this.infoEventAward.price};
          // this.orderServ.createOrder(orderEvent).subscribe({
          //   next: (data) => {
          //     if (!data.url) return;
          //     window.location.href = data.url;
          //   },
          //   error: (error) => {
          //     this.toastServ.openToast('res-error', 'danger', error.message)
          //     this.loadingServ.loadingOff();
          //   },
          //   complete: () => {
          //     this.loadingServ.loadingOff();
          //   }
          // })
        }
      }      
    }
  }

  getCountCards(eventId: string) {
    this.cardsServ.getCardCountForUserAndEvent(eventId).subscribe({
      next: (value) => {
        this.cantCard = value;
      },
      error: (error) => {
        this.toastServ.openToast('get-count-cards', 'danger', 'Error al obtener la cantidad de cards compradas');
      }
    })
  }
}
