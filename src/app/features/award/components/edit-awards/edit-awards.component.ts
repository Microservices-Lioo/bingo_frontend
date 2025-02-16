import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AwardService } from '../../services/award.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { FormArray, FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AwardInterface, EditAwardInterface, UpdateAwardInterface } from '../../interfaces';
import { CustomInputComponent } from '../../../../ui/inputs/custom-input/custom-input.component';
import { PrimaryButtonComponent } from '../../../../ui/buttons/primary-button/primary-button.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ModalService } from '../../../../shared/services/modal.service';
import { ModalInterface } from 'flowbite';

export interface ItemAwardForm {
  id: FormControl<number>;
  index: FormControl<number>;
  name: FormControl<string>;
  description: FormControl<string>;
}

export type CustomFormAwardGroup = FormGroup<ItemAwardForm>;

@Component({
  selector: 'app-edit-awards',
  imports: [ReactiveFormsModule, CustomInputComponent, PrimaryButtonComponent, IconComponent],
  templateUrl: './edit-awards.component.html',
  styles: ``
})
export class EditAwardsComponent {
  loading: boolean = false;
  dataAward: AwardInterface[] =[];
  modal: ModalInterface | null = null;
  awardIdSelected: number = -1;
  awardIndexSelected: number = -1;

  fb = inject(NonNullableFormBuilder);

  editAwardForm: FormGroup<{ items: FormArray<CustomFormAwardGroup> }>  = this.fb.group({
      items: this.fb.array<CustomFormAwardGroup>([]),      
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private awardServ: AwardService,
    private toastServ: ToastService,
    private modalServ: ModalService
  ) {
    
    this.getAwardsByEvent();
    effect(() => {
      this.editAwardForm.controls.items.valueChanges.subscribe(() => {
        this.itemsAward.set([...this.editAwardForm.controls.items.controls])
      });
    });
  }

  itemsAward = signal(this.editAwardForm.controls.items.controls);

  get eventId() {
    const id = this.route.snapshot.paramMap.get('eventId');
    if(id == null) {
      this.router.navigate(['']);
      return;
    }
    return parseInt(id);
  }

  getAwardsByEvent() {
    const eventId = this.eventId;
    if (!eventId) return;
    this.awardServ.getAwardsByEvent(eventId).subscribe({
      next: (dataAwards) => {
       if (dataAwards.length === 0) {
        this.router.navigate(['']);
        this.toastServ.openToast('get-awards', 'danger', 'No existen premios de tal evento');
       } else {
        this.dataAward = dataAwards;
        dataAwards.forEach((award) => {
          this.setAward(award);
        })
       }
      },
      error: (error) => {
        this.toastServ.openToast('get-awards', 'danger', `${error.message}`);
      }
    })
  }

  setAward(award: EditAwardInterface) {
    const index = this.itemsAward().length + 1;
    const awardForm = this.fb.group<ItemAwardForm>({
      id: this.fb.control(award.id),
      index: this.fb.control(index),
      name: this.fb.control(award.name, { validators: [Validators.required]}),
      description: this.fb.control(award.description, { validators: [Validators.required]}),
    });

    this.editAwardForm.controls.items.push(awardForm);

    this.itemsAward.set([...this.editAwardForm.controls.items.controls]);
  }

  addAward() {
    const index = this.itemsAward().length + 1;
    const awardForm = this.fb.group<ItemAwardForm>({
      id: this.fb.control(0),
      index: this.fb.control(index),
      name: this.fb.control('', { validators: [Validators.required]}),
      description: this.fb.control('', { validators: [Validators.required]}),
    });

    this.editAwardForm.controls.items.push(awardForm);

    this.itemsAward.set([...this.editAwardForm.controls.items.controls]);
  }

  removeAward(i: number) {
    const award = this.getItemsAward.controls.find((value, index) => value.value.index == (i + 1));
    if (award && award.value && award.value.id && award.value.id != 0) {
      if (this.dataAward.length <= 1) {
        this.toastServ.openToast('creating-award', 'danger', 'Es requerido mantener un premio como mínimo');
        this.loading = false;
        return;
      }
      const modal = this.modalServ.createModal('delete-award-modal');
      this.modal = modal;
      this.modalServ.openModal(modal);
      this.awardIdSelected = award.value.id;
      this.awardIndexSelected = i;
    } else {
      if (this.itemsAward().length <= 1) {
        this.toastServ.openToast('creating-award', 'danger', 'Es requerido mantener un premio como mínimo');
        this.loading = false;
        return;
      }
      this.editAwardForm.controls.items.removeAt(i);
      this.itemsAward.set([...this.editAwardForm.controls.items.controls]);
    }    
  }

  get getItemsAward() {
    return this.editAwardForm.controls.items;
  }

  OnSubmitAwards() {
    if (this.itemsAward().length <= 0) {
      this.toastServ.openToast('creating-award', 'danger', 'Se debe ingresar como mínimo un premio');
      this.loading = false;
      return;
    }

    if (this.editAwardForm.invalid) {
      this.toastServ.openToast('creating-award', 'danger', 'Se debe completar todos los campos');
      this.loading = false;
      return;
    }

    const eventId = this.eventId;
    const newAwards = this.editAwardForm.getRawValue().items.filter(
      (value, index) => value.id === 0 && value.name != '' && value.description != '')
      .map(({name, description}) => ({ name: name, description: description, eventId: eventId}));
    
    if (newAwards.length === 0) return;
    this.loading = true;
    this.awardServ.createAwards(newAwards).subscribe({
      next: (dataAward) => {
        this.loading = false;
        this.toastServ.openToast('creating-award', 'success', 'Premios creados con éxito');
        this.router.navigate(['/events']);
      },
      error: (error) => {
        this.loading = false;
        this.toastServ.openToast('creating-award', 'danger', error.message);
      }
    })
  }

  updateAward(i: number) {
    const awardForm = this.getItemsAward.controls.find((value, index) => i == index);
    if (awardForm && awardForm.value && awardForm.value.id && awardForm.value.id != 0) {
      const award = awardForm.value;
      const awardOld = this.dataAward.find((value, index) => value.id === award.id );
      if (!awardOld || !award) {
        this.toastServ.openToast('updating-award', 'danger', 'El premio no fue encontrado');
        return;
      }
      const { name, description, eventId } = awardOld;

      const isChange = award.name !== name || award.description !== description;
      if (isChange && award.name && award.description) {
        const newDataAward: UpdateAwardInterface = {
          name: award.name,
          description: award.description,
          eventId: eventId,
        }
        this.awardServ.updateAward(awardOld.id, newDataAward).subscribe({
          next: (_) => {
            this.dataAward = this.dataAward.map((value, index) => value.id == award.id
              ? { ...value, name: award!.name!, description: award!.description! }
              : value
            );
            this.itemsAward.set([...this.editAwardForm.controls.items.controls]);
            this.toastServ.openToast('updating-award', 'success', 'Evento actualizado con éxito');
            this.resetDataSelected();
          },
          error: (error) => {
            this.resetDataSelected();
            this.toastServ.openToast('updating-award', 'danger', error.message);
          }
        });
      } {
      this.toastServ.openToast('updating-award', 'warning', 'El premio no hacido editado');
      }
    } else {
      this.toastServ.openToast('updating-award', 'warning', 'Primero debe guardar el formulario');
    }
  }

  resetDataSelected() {
    this.awardIdSelected = -1;
    this.awardIdSelected = -1;
    this.modal = null;
    this.loading = false;
  }

  modalAccept() {
    if (this.awardIdSelected > -1) {
      this.awardServ.deleteAward(this.awardIdSelected).subscribe({
        next: (_) => {
          this.editAwardForm.controls.items.removeAt(this.awardIndexSelected);
          this.itemsAward.set([...this.editAwardForm.controls.items.controls]);
          this.toastServ.openToast('removing-award', 'success', 'Premio eliminado con éxito');
          this.modalClose();
          this.resetDataSelected();
        },
        error: (error) => {
          this.modalClose();
          this.resetDataSelected();
          this.toastServ.openToast('removing-award', 'danger', error.message);
        }
      });
    }
  }

  modalClose() {
    if (!this.modal) return;

    this.modalServ.closeModal(this.modal);
  }
}
