import { UserService } from './../../../services/user.service';
import { Component, inject } from '@angular/core';
import { BtnPrimaryComponent } from "../../../components/btn-primary/btn-primary.component";
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../services/components/toast.service';
import { CustomInputComponent } from '../../../components/custom-input/custom-input.component';

export interface ItemForm {
    name: FormControl<string>,
    lastname: FormControl<string>,
    email: FormControl<string>,
    password: FormControl<string>
}

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [BtnPrimaryComponent, RouterLink, ReactiveFormsModule, CustomInputComponent],
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
        private userServ: UserService,
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
            this.userServ.register(registerData)
                .subscribe(
                    (values) => {
                        if (values && values.user && values.access_token && values.refresh_token) {
                            localStorage.setItem('access_token', values.access_token);
                            localStorage.setItem('refresh_token', values.refresh_token);
                            localStorage.setItem('user', JSON.stringify(values.user));
                            this.userServ.setCurrentUser(values.user);
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
