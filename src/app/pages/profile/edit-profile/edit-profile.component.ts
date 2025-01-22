import { Component, inject, OnInit } from '@angular/core';
import { CustomInputComponent } from '../../../components/custom-input/custom-input.component';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BtnPrimaryComponent } from '../../../components/btn-primary/btn-primary.component';
import { UserModel } from '../../../models';
import { UserService } from '../../../services/user.service';
import { ToastService } from '../../../services/components/toast.service';
import { UpdateUserInterface } from '../../../interfaces';

export interface ItemForm {
  name: FormControl<string>,
  lastname: FormControl<string>,
  email: FormControl<string>,
  password: FormControl<string>,
  new_password: FormControl<string>
  repit_new_password: FormControl<string>
}

@Component({
  selector: 'app-edit-profile',
  imports: [CustomInputComponent, ReactiveFormsModule, BtnPrimaryComponent],
  templateUrl: './edit-profile.component.html',
  styles: `
  .bg-container {
      width: 100%;
      height: calc(100vh - 56px); ;
      background-color: #dce2f6;
      background-image: radial-gradient(#859bfb 10%, transparent 10%),
                          radial-gradient(#859bfb 10%, transparent 10%);
      background-size: 100px 100px;
      background-position: 0 0, 50px 50px;
    } `
})
export class EditProfileComponent implements OnInit {
  user: UserModel | any = null;
  loading: boolean = false;

  fb = inject(NonNullableFormBuilder);
  editProfileForm: FormGroup<ItemForm>;

  constructor(
    private userServ: UserService,
    private toastServ: ToastService,
  ) {
    this.editProfileForm = this.fb.group<ItemForm>({
      name: this.fb.control('', { validators: [] }),
      lastname: this.fb.control('', { validators: [] }),
      email: this.fb.control('', { validators: [Validators.email] },),
      password: this.fb.control('', { validators: [Validators.required, Validators.minLength(8)] }),
      new_password: this.fb.control('', { validators: [Validators.minLength(8)] }),
      repit_new_password: this.fb.control('', { validators: [Validators.minLength(8)] })
    })
  }

  ngOnInit() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
      this.setValuesForm();
    }
  }

  setValuesForm() {
    this.editProfileForm.setValue({
      name: this.user.name,
      lastname: this.user.lastname,
      email: this.user.email,
      password: '',
      new_password: '',
      repit_new_password: ''
    })
  }

  OnSutmitEditProfil() {
    if (this.editProfileForm.invalid) {
      this.toastServ.openToast('update-profile', 'danger', 'Formulario inválido');
      return;
    }

    this.loading = true;

    const data = this.editProfileForm.value;
    if (data.new_password == '') delete data.new_password;
    if (data.repit_new_password == '') delete data.repit_new_password;

    this.userServ.updateUser(data as UpdateUserInterface).subscribe({
      next: (updateUser) => {
        if (updateUser) {
          localStorage.setItem('user', JSON.stringify(updateUser));
          this.userServ.setCurrentUser(updateUser);
          this.loading = false;
          this.toastServ.openToast('update-profile', 'success', 'Información actualizada');
        }
      },
      error: (error) => {
        this.loading = false;
        this.toastServ.openToast('update-profile', 'danger', error.message);
      }
    });
  }
}
