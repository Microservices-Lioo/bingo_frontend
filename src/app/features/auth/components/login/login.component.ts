import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services';
import { ToastService } from '../../../../shared/services/toast.service';
import { CustomButtonComponent } from "../../../../shared/components/ui/button/custom-button.component";
import { CustomInputComponent } from '../../../../shared/components/ui/input/custom-input.component';
import { IUserShared } from '../../../../shared/interfaces';

export interface ItemForm {
  email: FormControl<string>,
  password: FormControl<string>
}

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule, CustomButtonComponent, CustomInputComponent],
  templateUrl: './login.component.html',
  styles: `
    .bg-container {
      width: 100%;
      background-color: #dce2f6;
      background-image: radial-gradient(#859bfb 10%, transparent 10%),
                          radial-gradient(#859bfb 10%, transparent 10%);
      background-size: 100px 100px;
      background-position: 0 0, 50px 50px;
    }
  `
})
export class LoginComponent implements OnInit {
  loading: boolean = false;
  returnUrl: string = '/';

  fb = inject(NonNullableFormBuilder);

  loginForm: FormGroup<ItemForm>;

  constructor(
    private authServ: AuthService,
    private toastServ: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group<ItemForm>({
      email: this.fb.control('', { validators: [Validators.required, Validators.email] }),
      password: this.fb.control('', { validators: [Validators.required, Validators.minLength(8)] }),
    });
  }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
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
          const user: IUserShared = values.user;
          localStorage.setItem('access_token', values.access_token);
          localStorage.setItem('refresh_token', values.refresh_token);
          localStorage.setItem('user', JSON.stringify(user));
          this.authServ.setCurrentUser(user);
          this.authServ.setLoggedIn(true);
          this.loading = false;
          this.router.navigateByUrl(this.returnUrl);

        }
      },
      error: (error) => {
        this.loading = false;
        this.toastServ.openToast('auth', 'danger', error.message);
      }
    })
  }
}
