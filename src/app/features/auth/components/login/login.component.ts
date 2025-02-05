import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimaryButtonComponent } from '../../../../ui/buttons/primary-button/primary-button.component';
import { AuthService } from '../../services';
import { CustomInputComponent } from '../../../../ui/inputs/custom-input/custom-input.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { UserInterface } from '../../../../core/interfaces';

export interface ItemForm {
  email: FormControl<string>,
  password: FormControl<string>
}

@Component({
  selector: 'app-login',
  imports: [PrimaryButtonComponent, RouterLink, ReactiveFormsModule, CustomInputComponent],
  templateUrl: './login.component.html',
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
export class LoginComponent {
  loading: boolean = false;

  fb = inject(NonNullableFormBuilder);

  loginForm: FormGroup<ItemForm>;

  constructor(
    private authServ: AuthService,
    private toastServ: ToastService,
    private router: Router,
  ) {
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

    this.authServ.login(loginData).subscribe({
      next: (values) => {
        if (values && values.user && values.access_token && values.refresh_token) {
          const user: UserInterface = values.user;
          localStorage.setItem('access_token', values.access_token);
          localStorage.setItem('refresh_token', values.refresh_token);
          localStorage.setItem('user', JSON.stringify(user));
          this.authServ.setCurrentUser(user);
          this.authServ.setLoggedIn(true);
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
