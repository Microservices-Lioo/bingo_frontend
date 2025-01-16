import { Component, inject, signal } from '@angular/core';
import { BtnPrimaryComponent } from "../../components/btn-primary/btn-primary.component";
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { FormArray, FormBuilder, FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserModel } from '../../models';
import { ToastService } from '../../services/components/toast.service';
import { CustomInputComponent } from '../../components/custom-input/custom-input.component';

export interface ItemForm {
  email: FormControl<string>,
  password: FormControl<string>
}

@Component({
  selector: 'app-auth',
  imports: [BtnPrimaryComponent, RouterLink, ReactiveFormsModule, CustomInputComponent],
  templateUrl: './auth.component.html',
  styles: `
    .bg-container {
      width: 100%;
      height: calc(100vh - 56px); ;
      background-color: #dce2f6;
      background-image: radial-gradient(#859bfb 10%, transparent 10%),
                          radial-gradient(#859bfb 10%, transparent 10%);
      background-size: 100px 100px;
      background-position: 0 0, 50px 50px;
    }
  `
})
export class AuthComponent {
  loading: boolean = false;

  fb = inject(NonNullableFormBuilder);

  loginForm: FormGroup<ItemForm>;

  constructor(
    private userServ: UserService,
    private toastServ: ToastService,
    private router: Router,
  ) {
    // this.loginForm = this.fb.group({
    //   email: new FormControl('', [Validators.required, Validators.email]),
    //   password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    // });
    this.loginForm = this.fb.group<ItemForm>({
      email: this.fb.control('', { validators: [Validators.required, Validators.email] }),
      password: this.fb.control('', { validators: [Validators.required, Validators.minLength(8)] }),
    });

  }

  OnSubmit() {

    if (this.loginForm.invalid) {
      console.log('Form is invalid:', this.loginForm.errors);
      return;
    }
    this.loading = true;

    const values = this.loginForm.value;
    const loginData = { email: values.email ?? '', password: values.password ?? '' };

    this.userServ.login(loginData).subscribe({
      next: (values) => {
        if (values && values.user && values.access_token && values.refresh_token) {
          const user: UserModel = values.user;
          localStorage.setItem('access_token', values.access_token);
          localStorage.setItem('refresh_token', values.refresh_token);
          localStorage.setItem('user', JSON.stringify(user));
          this.userServ.setCurrentUser(user);
          this.loading = false;
          this.router.navigate(['/', 'home']);

        }
      },
      error: (error) => {
        this.loading = false;
        this.toastServ.openToast('auth', 'danger', error.message);
      }
    })
  }
}
