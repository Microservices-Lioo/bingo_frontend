import { Component, inject, OnInit } from '@angular/core';
import { IEvent, UpdateEvent } from '../../interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { formatDate, Location } from '@angular/common';
import { ToastService } from '../../../../shared/services/toast.service';
import { EventService } from '../../services/event.service';
import { CustomInputComponent } from '../../../../shared/components/ui/input/custom-input.component';
import { CustomButtonComponent } from "../../../../shared/components/ui/button/custom-button.component";

export interface ItemEventForm {
  name: FormControl<string>,
  description: FormControl<string>,
  start_time: FormControl<string>,
  price: FormControl<number>
}
@Component({
  selector: 'app-edit-event',
  imports: [CustomInputComponent, ReactiveFormsModule, CustomButtonComponent],
  templateUrl: './edit-event.component.html',
  styles: ``
})
export class EditEventComponent implements OnInit {
  event!: IEvent;
  loading: boolean = false;
  minDate: string = '';

  fb = inject(NonNullableFormBuilder);

  editEventForm!: FormGroup<ItemEventForm>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastServ: ToastService,
    private eventServ: EventService,
    private location: Location
  ) {}

  ngOnInit() {
    this.eventServ.event$.subscribe(eventSelected => {
      if (!eventSelected) {
        this.goBack();
        return;
      }
      this.minDate = formatDate(new Date(), 'yyyy-MM-ddTHH:mm', 'en');
      this.setForm(eventSelected);
      this.event = eventSelected;
    });
    if (!this.event) {
      this.goBack();
    }
  }

  // LLeno el formulario con los datos del evento
  setForm(event: IEvent) {
    this.editEventForm = this.fb.group<ItemEventForm>({
      name: this.fb.control(event.name, { validators: [Validators.required]}),
      description: this.fb.control(event.description, { validators: [Validators.required]}),
      start_time: this.fb.control(formatDate(event.start_time, 'yyyy-MM-ddTHH:mm', 'en'), { validators: [Validators.required]}),
      price: this.fb.control(event.price, { validators: [Validators.required, Validators.min(1)]}),
    });
  }

  // Envio el formulario para actualizar
  submitEvent() {
    if (this.editEventForm.invalid) {
      this.toastServ.openToast('editing-event', 'danger', 'Se debe completar todos los campos requeridos');
      return;
    }

    const { start_time, ...data } = this.editEventForm.value;
    this.loading = true;

    let dataEvent: UpdateEvent = {
      name: data.name,
      description: data.description,
      price: data.price,
    };
    dataEvent.start_time = new Date(start_time!);
    this.eventServ.updateEvent(this.event.id, dataEvent).subscribe({
      next: (_) => {
        this.loading = false;
        this.router.navigate(['..'], { relativeTo: this.route });
        this.toastServ.openToast('editing-event', 'success', 'Evento editado exitosamente');
      },
      error: (error) => {
        this.loading = false;
        this.toastServ.openToast('editing-event', 'danger', error.message);
      }
    }
    )
  }

  // Regregso a la ruta anterior
  goBack() {
    this.location.back();
  }
}
