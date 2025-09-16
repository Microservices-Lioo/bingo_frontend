import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { EventService } from '../../services/event.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ICreateEvent, ICreateEventAwards } from '../../interfaces';
import { formatDate, Location } from '@angular/common';
import { ICreateAward } from '../../../award/interfaces';
import { CommonModule } from '@angular/common';
import { CustomButtonComponent } from '../../../../shared/components/ui/button/custom-button.component';
import { CustomInputComponent } from '../../../../shared/components/ui/input/custom-input.component';

export interface ItemEventForm {
  name: FormControl<string>,
  description: FormControl<string>,
  price: FormControl<number>
  start_time: FormControl<string>
}

export interface ItemAwardForm {
  name: FormControl<string>,
  description_award: FormControl<string>
}

export type CustomFormEventGroup = FormGroup<ItemAwardForm>;

export interface ItemStepper {
  id: number;
  name: string;
  completed: boolean;
  actived: boolean;
}

@Component({
  selector: 'app-create-event',
  imports: [
    CustomInputComponent,
    CustomButtonComponent,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './create-event.component.html',
  styles: ``,
  standalone: true
})
export class CreateEventComponent implements OnInit {
  loadingEvent: boolean = false;
  loadingConfirmation: boolean = false;
  listSteppers: ItemStepper[] = [];
  eventAward: ICreateEventAwards | null = null;
  minDate: string = '';

  fb = inject(NonNullableFormBuilder);

  createEventForm: FormGroup<ItemEventForm> = this.fb.group<ItemEventForm>({
    name: this.fb.control('', { validators: [Validators.required] }),
    description: this.fb.control('', { validators: [Validators.required] }),
    price: this.fb.control(0, { validators: [Validators.required, Validators.min(1)] }),
    start_time: this.fb.control("", { validators: [Validators.required] })
  });

  createAwardForm: FormGroup<{ items: FormArray<CustomFormEventGroup> }> = this.fb.group({
    items: this.fb.array<CustomFormEventGroup>([]),
  });


  constructor(
    private eventServ: EventService,
    private toastServ: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
  ) {}

  ngOnInit() {
    this.minDate = formatDate(new Date(), 'yyyy-MM-ddTHH:mm', 'en');
    
    this.listSteppers = [
      { id: 1, name: 'Evento', completed: false, actived: true },
      { id: 2, name: 'Premios', completed: false, actived: false },
      { id: 3, name: 'Confirmación', completed: false, actived: false },
    ];
    this.addAward();
  }

  // Actualizar el stepper
  stepStatus(id: number) {
    this.listSteppers = this.listSteppers.map( (stepper, i) => {
      return stepper.actived ? { ...stepper, completed: true, actived: false } : stepper
    });
    this.listSteppers = this.listSteppers.map( (stepper, i) => {
      return stepper.id === id ? { ...stepper, actived: true } : stepper
    });
  }

  // Obtener el control de cada item
  itemControl(index: number, control: string): FormControl {
    const formGroup = this.getItemsAward.at(index) as FormGroup;
    return formGroup.get(control) as FormControl;
  }

  // Siguiente: Ingresar premios
  nextAward() {
    if (this.createEventForm.invalid) {
      this.toastServ.openToast('create-event', 'danger', 'Se debe completar todos los campos requeridos');
      return;
    }
    this.stepStatus(2);
    this.toastServ.openToast('create-event', 'success', 'Información almacenada del evento')
  }

  // Siguiente: Confirmar datos del evento
  nextConf() {
    if (this.createAwardForm.invalid) {
      this.toastServ.openToast('create-awards', 'danger', 'Debes completar todos los campos');
      return;
    }

    if (this.getItemsAward.length <= 0) {
      this.toastServ.openToast('create-awards', 'danger', 'Se debe agregar un premio como mínimo');
      return;
    }

    if (this.getEvent == null) {
      this.toastServ.openToast('create-awards', 'danger', 'No existen datos del evento');
      return;
    }

    this.eventAward = {
      event: this.getEvent,
      awards: this.getAwards.map(award => (
        { id: "", ...award}))
    }

    this.stepStatus(3);
    this.toastServ.openToast('create-awards', 'success', 'Premios almacenados');
  }

  // Agregar un nuevo campo en el formulario de items
  addAward() {
    const awardForm = this.fb.group<ItemAwardForm>({
      name: this.fb.control('', { validators: [Validators.required] }),
      description_award: this.fb.control('', { validators: [Validators.required] }),
    });

    this.getItemsAward.push(awardForm);
  }

  // Eliminar un item del formulario
  removeAward(index: number) {
    if (index === 0) return;
    this.getItemsAward.removeAt(index);
  }

  // Obtener Los items de tipo FormArray
  get getItemsAward() {
    return this.createAwardForm.controls.items;
  }

  // Crear un evento con sus premios
  createEvent() {
    const event = this.getEvent;
    const awards = this.getAwards;

    if (!event) {
      this.toastServ.openToast('creating-event', 'danger', 'No hay datos del evento');
      this.loadingConfirmation = false;
      return;
    }

    if (!awards) {
      this.toastServ.openToast('creating-awards', 'danger', 'No existen premios');
      this.loadingConfirmation = false;
      return;
    }

    this.loadingConfirmation = true;

    const eventAwards = { event, awards };

    this.eventServ.createEventAwards(eventAwards).subscribe({
      next: (_) => {
        this.router.navigate(["..", { relativeTo: this.route }]);
        this.loadingConfirmation = false;
        this.toastServ.openToast('creating-event', 'success', "Evento creado!");
      },
      error: (error) => {
        this.loadingConfirmation = false;
        this.toastServ.openToast('creating-event', 'danger', error.message);
      }
    });
  }

  // Obtener los datos de los premios del form 
  get getAwards(): ICreateAward[] {
    const awards = this.createAwardForm.getRawValue().items.map(
      ({ name, description_award }) => ({ name: name, description: description_award }));
    return awards;
  }

  // Obtener los datos del evento del form
  get getEvent(): ICreateEvent | null {
    const valueForm = this.createEventForm.value;
    const { name, description, price, start_time } = valueForm;
    if (!name || !description || !price || !start_time) return null;
    return { name, description, price, start_time: new Date(start_time) };
  }

  // Regresar
  goBack() {
    this.location.back();
  }

}
