import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimaryButtonComponent } from '../../../../ui/buttons/primary-button/primary-button.component';
import { CustomInputComponent } from '../../../../ui/inputs/custom-input/custom-input.component';
import { AuthService } from '../../services';
import { ToastService } from '../../../../shared/services/toast.service';

export interface ItemForm {
    name: FormControl<string>,
    lastname: FormControl<string>,
    email: FormControl<string>,
    password: FormControl<string>
}

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [PrimaryButtonComponent, RouterLink, ReactiveFormsModule, CustomInputComponent],
    templateUrl: './register.component.html',
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
export class RegisterComponent {
    loading: boolean = false;

    fb = inject(NonNullableFormBuilder);

    registerForm: FormGroup<ItemForm>;
    constructor(
        private authServ: AuthService,
        private toastServ: ToastService,
        private router: Router

    ) {
        this.registerForm = this.fb.group<ItemForm>({
            name: this.fb.control('', { validators: [Validators.required] }),
            lastname: this.fb.control('', { validators: [Validators.required] }),
            email: this.fb.control('', { validators: [Validators.required, Validators.email] }),
            password: this.fb.control('', { validators: [Validators.required, Validators.minLength(8)] }),
        });
    }

    OnSubmit() {
        if (this.registerForm.invalid) {
            console.log('Form is invalid:', this.registerForm.errors);
            return;
        }
        this.loading = true;

        const values = this.registerForm.value;
        const registerData =
        {
            name: values.name ?? '',
            lastname: values.lastname ?? '',
            email: values.email ?? '',
            password: values.password ?? ''
        };

        if (this.registerForm.valid) {
            this.loading = true;
            this.authServ.register(registerData)
                .subscribe(
                    (values) => {
                        if (values && values.user && values.access_token && values.refresh_token) {
                            localStorage.setItem('access_token', values.access_token);
                            localStorage.setItem('refresh_token', values.refresh_token);
                            localStorage.setItem('user', JSON.stringify(values.user));
                            this.authServ.setCurrentUser(values.user);
                            this.authServ.setLoggedIn(true);
                            this.loading = false;
                            this.router.navigate(['/', 'home']);

                        }

                    },
                    (error) => {
                        this.loading = false;
                        this.toastServ.openToast('register', 'danger', error.message);
                    }
                );
        }
    }
}
