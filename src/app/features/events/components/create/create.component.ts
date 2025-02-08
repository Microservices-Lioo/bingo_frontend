import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { CustomInputComponent } from '../../../../ui/inputs/custom-input/custom-input.component';
import { PrimaryButtonComponent } from '../../../../ui/buttons/primary-button/primary-button.component';
import { FormArray, FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { Router } from '@angular/router';
import { CreateEvent } from '../../interfaces';

export interface ItemEventForm {
  name: FormControl<string>,
  description: FormControl<string>,
  start_time: FormControl<Date>,
  price: FormControl<number>
}

export interface ItemAwardForm {
  id: FormControl<number>,
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
  selector: 'app-create',
  imports: [CustomInputComponent, PrimaryButtonComponent, ReactiveFormsModule],
  templateUrl: './create.component.html',
  styles: ``,
  standalone: true
})
export class CreateComponent implements OnInit {
  loadingEvent: boolean = false;
  listSteppers: ItemStepper[] = [];
  dataEvent: CreateEvent | null = null;

  fb = inject(NonNullableFormBuilder);

  createEventForm: FormGroup<ItemEventForm> = this.fb.group<ItemEventForm>({
    name: this.fb.control('', { validators: [Validators.required] }),
    description: this.fb.control('', { validators: [Validators.required] }),
    start_time: this.fb.control(new Date(), { validators: [Validators.required] }),
    price: this.fb.control(0, { validators: [Validators.required, Validators.min(1)]})
  });

  createAwardForm: FormGroup<{ items: FormArray<CustomFormEventGroup> }> = this.fb.group({
    items: this.fb.array<CustomFormEventGroup>([]),      
  });

  itemsAward = signal(this.createAwardForm.controls.items.controls);

  constructor(
    private eventServ: EventService,
    private toastServ: ToastService,
    private router: Router
  ) {
    effect(() => {
      this.createAwardForm.controls.items.valueChanges.subscribe(() => {
        this.itemsAward.set([...this.createAwardForm.controls.items.controls])
      });
    });
  }

  ngOnInit() {
    this.listSteppers = [
      { id: 1, name: 'Evento', completed: false, actived: true },
      { id: 2, name: 'Premios', completed: false, actived: false },
      { id: 3, name: 'Confirmación', completed: false, actived: false },
    ];
    this.addAward();
  }

  stepStatus(id: number) {
    if (id == 1) {
      this.listSteppers[0].actived = true;
      this.listSteppers[1].actived = false;
      this.listSteppers[2].actived = false;
    }
    
    if (id == 2) {
      this.listSteppers[0].actived = false;
      this.listSteppers[1].actived = true;
      this.listSteppers[2].actived = false;
    }

    if (id == 3) {
      this.listSteppers[0].actived = false;
      this.listSteppers[1].actived = false;
      this.listSteppers[2].actived = true;
    }
  }

  OnSubmitEventNextAward() {
    if(this.createEventForm.invalid) {
      console.log('Form is invalid:', this.createEventForm.errors);
      return;
    }

    this.dataEvent = this.createEventForm.value as CreateEvent;

    this.listSteppers[0].completed = true;
    this.stepStatus(2);

    this.toastServ.openToast('create-event', 'success', 'Información almacenada del evento')
  }

  OnSubmitAwardsNextConf() {
    if(this.createAwardForm.invalid) {
      console.log('Form is invalid:', this.createAwardForm.errors);
      this.toastServ.openToast('create-event', 'danger', 'Se debe agregar un premio como mínimo');
      return;
    }

    if (this.itemsAward.length <= 0) {
      this.toastServ.openToast('create-event', 'danger', 'Se debe agregar un premio como mínimo');
      return;
    }

    this.listSteppers[1].completed = true;
    this.stepStatus(3);

    this.toastServ.openToast('create-event', 'success', 'Premios almacenados');
  }

  addAward() {
    const id = this.itemsAward().length + 1;
    const awardForm = this.fb.group<ItemAwardForm>({
      id: this.fb.control(id),
      name: this.fb.control('', { validators: [Validators.required] }),
      description_award: this.fb.control('', { validators: [Validators.required] }),
    });

    this.createAwardForm.controls.items.push(awardForm);

    this.itemsAward.set([...this.createAwardForm.controls.items.controls]);
  }

  removeAward(index: number) {
    this.createAwardForm.controls.items.removeAt(index);
    this.itemsAward.set([...this.createAwardForm.controls.items.controls]);
  }

  get getItemsAward() {
    return this.createAwardForm.controls.items;
  }

  createEvent() {
    // petición con para guardar el nuevo evento
    // pretición para guardar los premios para el evento
  }

}
