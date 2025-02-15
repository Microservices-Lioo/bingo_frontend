import { Component, inject } from '@angular/core';
import { EventInterface, UpdateEvent } from '../../interfaces';
import { Router } from '@angular/router';
import { PrimaryButtonComponent } from '../../../../ui/buttons/primary-button/primary-button.component';
import { CustomInputComponent } from '../../../../ui/inputs/custom-input/custom-input.component';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { ToastService } from '../../../../shared/services/toast.service';
import { EventService } from '../../services/event.service';
import { pipe } from 'rxjs';

export interface ItemEventForm {
  name: FormControl<string>,
  description: FormControl<string>,
  start_time: FormControl<string>,
  price: FormControl<number>
}
@Component({
  selector: 'app-edit-event',
  imports: [PrimaryButtonComponent, CustomInputComponent, ReactiveFormsModule],
  templateUrl: './edit-event.component.html',
  styles: ``
})
export class EditEventComponent {
  event: EventInterface;
  loading: boolean = false;
  minDate: string = '';

  fb = inject(NonNullableFormBuilder);

  editEventForm: FormGroup<ItemEventForm>;

  constructor(
    private router: Router,
    private toastServ: ToastService,
    private eventServ: EventService
  ) {
    const navigation = this.router.getCurrentNavigation();
    const event = navigation?.extras.state?.['event'] || {};
    if (!event) {
      this.router.navigate(['events']);
    }
    this.event = event;
    this.minDate = formatDate(new Date(), 'yyyy-MM-ddTHH:mm', 'en');
    this.editEventForm = this.fb.group<ItemEventForm>({
      name: this.fb.control(event.name, { validators: [Validators.required]}),
      description: this.fb.control(event.description, { validators: [Validators.required]}),
      start_time: this.fb.control(formatDate(event.start_time, 'yyyy-MM-ddTHH:mm', 'en'), { validators: [Validators.required]}),
      price: this.fb.control(event.price, { validators: [Validators.required, Validators.min(1)]}),
    });
  }

  OnSubmitEvent() {
    if (this.editEventForm.invalid) {
      this.toastServ.openToast('editing-event', 'danger', 'Se debe completar todos los campos requeridos');
      return;
    }
    const { start_time, ...data } = this.editEventForm.value;
    this.loading = true;

    let dataEvent: UpdateEvent = data as UpdateEvent;
    dataEvent.start_time = new Date(start_time!);

    this.eventServ.updateEvent(this.event.id, dataEvent).subscribe({
      next: (_) => {
        this.loading = false;
        this.router.navigate(['events']);
        this.toastServ.openToast('editing-event', 'success', 'Evento editado exitosamente');
      },
      error: (error) => {
        this.loading = false;
        this.toastServ.openToast('editing-event', 'danger', error.message);
      }
    }
    )
  }
}
