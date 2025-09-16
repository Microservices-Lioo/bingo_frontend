import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AwardService } from '../../services/award.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { FormArray, FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IAward, EditIAward } from '../../interfaces';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ModalService } from '../../../../shared/services/modal.service';
import { ModalInterface } from 'flowbite';
import { Location } from '@angular/common';
import { CustomButtonComponent } from '../../../../shared/components/ui/button/custom-button.component';
import { CustomInputComponent } from '../../../../shared/components/ui/input/custom-input.component';

export interface ItemAwardForm {
  id: FormControl<string>;
  index: FormControl<number>;
  name: FormControl<string>;
  description: FormControl<string>;
}

export type CustomFormAwardGroup = FormGroup<ItemAwardForm>;

@Component({
  selector: 'app-edit-awards',
  imports: [ReactiveFormsModule, CustomInputComponent, CustomButtonComponent, IconComponent],
  templateUrl: './edit-awards.component.html',
  styles: ``
})
export class EditAwardsComponent {
  loading: boolean = false;
  dataAward: IAward[] = []; // Premios
  modal: ModalInterface | null = null;
  awardIdSelected: string = "";
  awardIndexSelected: number = -1;
  fb = inject(NonNullableFormBuilder);

  editAwardForm: FormGroup<{ items: FormArray<CustomFormAwardGroup> }>  = this.fb.group({
      items: this.fb.array<CustomFormAwardGroup>([]),      
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private awardServ: AwardService,
    private toastServ: ToastService,
    private modalServ: ModalService
  ) {
    
    this.getAwardsByEvent();
    effect(() => {
      this.editAwardForm.controls.items.valueChanges.subscribe((item) => {
        // console.log(item);
        this.itemsAward.set([...this.editAwardForm.controls.items.controls])
      });
    });
  }

  itemsAward = signal(this.editAwardForm.controls.items.controls);

  // Obtener el id del evento
  get eventId() {
    const id = this.route.snapshot.paramMap.get('eventId');
    if(id == null) {
      this.router.navigate(['']);
      return;
    }
    return id;
  }

  // Obtener los premios de un evento perteneciente al usuario
  getAwardsByEvent() {
    const eventId = this.eventId;
    if (!eventId) return;
    this.awardServ.getAwardsByEvent(eventId).subscribe({
      next: (dataAwards) => {
       if (dataAwards.length === 0) {
        this.router.navigate(['../../events'], { relativeTo: this.route });
        this.toastServ.openToast('get-awards', 'danger', 'No existen premios de tal evento');
       } else {
        this.dataAward = dataAwards;
        dataAwards.forEach((award) => {
          this.setAward(award);
        })
       }
      },
      error: (error) => {
        this.router.navigate(['../../events'], { relativeTo: this.route });
        this.toastServ.openToast('get-awards', 'danger', `${error.message}`);
      }
    })
  }

  // Agregar los items obtenidos de la api al form
  setAward(award: EditIAward) {
    const index = this.itemsAward().length + 1;
    const awardForm = this.fb.group<ItemAwardForm>({
      id: this.fb.control(award.id),
      index: this.fb.control(index),
      name: this.fb.control(award.name, { validators: [Validators.required]}),
      description: this.fb.control(award.description, { validators: [Validators.required]}),
    });

    // Agregar los awards al formulario
    this.editAwardForm.controls.items.push(awardForm);

    // Sobre escribir los datos del formulario
    this.itemsAward.set([...this.editAwardForm.controls.items.controls]);
  }

  // Agregar nuevo item al formulario
  addAward() {
    const index = this.itemsAward().length + 1;
    const awardForm = this.fb.group<ItemAwardForm>({
      id: this.fb.control(""),
      index: this.fb.control(index),
      name: this.fb.control('', { validators: [Validators.required]}),
      description: this.fb.control('', { validators: [Validators.required]}),
    });

    this.editAwardForm.controls.items.push(awardForm);

    this.itemsAward.set([...this.editAwardForm.controls.items.controls]);
  }

  // Eliminar award del formulario
  removeAwardForm(i: number) {
    if (this.itemsAward().length <= 1) {
      this.toastServ.openToast('remove-award', 'danger', 'Es requerido mantener un premio como mínimo');
      this.loading = false;
      return;
    }

    const award = this.editAwardForm.controls.items.value.find((award, index) => award.index === (i + 1));
    if (!award) {
      this.toastServ.openToast('remove-award', 'danger', 'El premio no existe');
    } else if (award && award.id) {
      const modal = this.modalServ.createModal('delete-award-modal');
      this.modal = modal;
      this.modalServ.openModal(modal);
      this.awardIdSelected = award.id;
      this.awardIndexSelected = i;
    }    
  }

  get getItemsAward() {
    return this.editAwardForm.controls.items;
  }

  // Formulario modificado
  submitAwards() {
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

    if (!eventId) {
      this.router.navigate(['../../events', { relativeTo: this.route }]);
      this.toastServ.openToast('creating-award', 'danger', 'El identificador del evento no existe');
    }
    
    // Crear los nuevos premois
    this.createAwards();

    // Actualizar los premios
    this.updateAward();
    
    this.loading = false;
    this.toastServ.openToast('creating-award', 'success', 'Actualización exitosa');
    this.router.navigate(['../../../events'], { relativeTo: this.route });
  }

  // Creación de premios http
  createAwards() {
    const newAwards = this.editAwardForm.getRawValue().items.filter(
      (award, index ) => {
        const awardOld = this.dataAward.find( a => a.id === award.id);
        return !awardOld ? award : undefined;
      });
    
    if (newAwards.length === 0) {
      return;
    }
    // crear muevos premios
    if (newAwards.length === 1) {
      const { id, index, ...data} = newAwards[0];
      this.awardServ.createAward({...data, eventId: this.eventId!}).subscribe({
        error: (error) => {
          this.toastServ.openToast('creating-award', 'danger', error.message);
        }
      });
    } else {
      const awards = newAwards.map(award => ({ name: award.name, description: award.description, eventId: this.eventId! }))
      this.awardServ.createAwards(awards).subscribe({
        error: (error) => {
          this.toastServ.openToast('creating-award', 'danger', error.message);
        }
      });
    }
  }

  // Actualizacióm de premios http
  updateAward() {
    const updateAwards = this.editAwardForm.getRawValue().items.filter(
      (award, index ) => {
        const awardOld = this.dataAward.find( a => a.id === award.id && (a.name !== award.name || a.description !== award.description));
        return awardOld ? award : undefined;
    }).map( award => ({ id: award.id, name: award.name, description: award.description }));

    if (updateAwards.length === 0) {
      console.log('saliooo')
      return;
    }

    updateAwards.forEach(award => {
      const {id, ...data} = award;
      this.awardServ.updateAward(id, data).subscribe({
        error: (error) => {
          this.resetDataSelected();
          this.toastServ.openToast('updating-award', 'danger', error.message);
        }
      });
    });    
  }

  // Eliminar premio http
  deleteAward(id: string) {
    this.awardServ.deleteAward(id).subscribe({
      next: (_) => {
        this.editAwardForm.controls.items.removeAt(this.awardIndexSelected);
        this.itemsAward.set([...this.editAwardForm.controls.items.controls]);
        this.toastServ.openToast('removing-award', 'success', 'Premio eliminado con éxito');
        this.loading = false;
        this.modalClose();
        this.resetDataSelected();
      },
      error: (error) => {
        this.modalClose();
        this.toastServ.openToast('creating-award', 'danger', error.message);
        this.loading = false;
      }
    });
  }

  resetDataSelected() {
    this.awardIdSelected = "";
    this.awardIndexSelected = -1;
    this.modal = null;
    this.loading = false;
  }

  // Modal de eliminación ACEPTAR
  modalAccept() {
    if (this.awardIdSelected != "") {
      this.deleteAward(this.awardIdSelected);
    }
  }

  // Modal de eliminación CANCELAR
  modalClose() {
    if (!this.modal) return;

    this.modalServ.closeModal(this.modal);
  }

  // Retornar a la ruta anterior
  onBack() {
    this.location.back();
  }
}
