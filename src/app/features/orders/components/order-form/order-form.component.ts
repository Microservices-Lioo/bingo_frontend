import { Component, effect, inject } from '@angular/core';
import { IEventAwards } from '../../../events/interfaces';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../../events/services/event.service';
import { CardsServiceShared, LoadingService, ToastService } from '../../../../shared/services';
import { UserService } from '../../../profile/services';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../../auth/services';
import { CustomInputComponent } from '../../../../shared/components/ui/input/custom-input.component';
import { CustomButtonComponent } from "../../../../shared/components/ui/button/custom-button.component";
import { LoadingIndicatorComponent } from "../../../../shared/components/loading-indicator/loading-indicator.component";
import { finalize, map, switchMap } from 'rxjs';
import { ICreateOrder } from '../../interfaces';

export interface ItemForm {
  quantity: FormControl<number>
}

@Component({
  selector: 'app-order-form',
  imports: [
    CommonModule,
    IconComponent,
    ReactiveFormsModule,
    CustomInputComponent,
    RouterLink,
    CustomButtonComponent,
    LoadingIndicatorComponent
],
  templateUrl: './order-form.component.html',
})
export class OrderFormComponent {
  infoEventAward: IEventAwards | null = null;
  owner = 'Desconocido';
  letterOwner = 'D';
  cantCard = 0;
  winners: { id: string, name: string}[] = [];

  fb = inject(NonNullableFormBuilder);

  constructor(
    private router: Router,
    protected route: ActivatedRoute,
    private eventServ: EventService,
    private toastServ: ToastService,
    private userServ: UserService,
    protected loadingServ: LoadingService,
    private orderServ: OrderService,
    private cardsServ: CardsServiceShared,
    protected authServ: AuthService
  ) {}

  createCard: FormGroup<ItemForm> = this.fb.group<ItemForm>({
    quantity: this.fb.control(1, { validators: [Validators.required, Validators.min(1)]})
  });

  ngOnInit() {
    this.loadingServ.on();
    this.route.paramMap.subscribe(value => {
      const eventId = value.get('id');
      if (eventId) {
        this.eventServ.getEventWithAwards(eventId).pipe(
          switchMap( 
            event => this.userServ.getUser(event.userId)
            .pipe(map(user => ({event, user})))
          ),
          switchMap(
            ({event, user}) => this.cardsServ.numberCardsToUserFromEvent(event.id)
            .pipe(map(cant => ({event, user, cant})))
          ),
          finalize(() => this.loadingServ.off())
        ).subscribe({
          next: ({event, user, cant}) => {
            this.infoEventAward = event;

            if (user) {
              const { name, lastname } = user;
              const username = name + ' ' + lastname;
              this.owner = username != this.owner ? username : this.owner;
              this.getLetter();
            }

            this.cantCard = cant;
          },
          error: (error) => {
            console.error(error);
            this.router.navigate(['..']);
            this.loadingServ.off();
          }
        });        
      } else {
        this.router.navigate(['..']);
        this.loadingServ.off();
      }
    });   
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

  buy() {
    this.loadingServ.on();

    if (this.createCard.invalid) {
      this.toastServ.openToast('invalid-form', 'danger', 'Formulario invalido.');
      this.loadingServ.off();
    } else {
      if (this.infoEventAward === null) {
        this.toastServ.openToast('event-data', 'danger', 'No se encontró la información del evento.')
        this.loadingServ.off();
      } else {
        const quantity = this.createCard.value.quantity;
        if (!quantity) {
          this.toastServ.openToast('quantity-data', 'danger', 'No se especificó la cantidad de elementos a comprar para este evento.')
          this.loadingServ.off();
      } else {
        const orderEvent: ICreateOrder = { quantity: typeof quantity == 'string' ? parseInt(quantity) : quantity, eventId: this.infoEventAward.id };
          this.orderServ.createOrder(orderEvent).subscribe({
            next: (data) => {
              if (!data.url) return;
              window.location.href = data.url;
            },
            error: (error) => {
              console.error(error);
              this.toastServ.openToast('res-error', 'danger', "Error crear la orden de pago");
              this.loadingServ.off()
            },
            complete: () => this.loadingServ.off(),
          })
        }
      }      
    }
  }
}
