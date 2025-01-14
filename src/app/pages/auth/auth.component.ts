import { Component } from '@angular/core';
import { BtnPrimaryComponent } from "../../components/btn-primary/btn-primary.component";
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserModel } from '../../models';
import { ToastService } from '../../services/components/toast.service';

@Component({
  selector: 'app-auth',
  imports: [BtnPrimaryComponent, RouterLink, ReactiveFormsModule],
  template: `
    <div class="bg-container flex justify-center items-center mt-[56px]">      

      <div class="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 dark:bg-[#14294a]">
          <form class="space-y-6" [formGroup]="loginForm">
              <h5 class="text-xl font-medium text-gray-900 dark:text-white">Iniciar sesión</h5>
              <div>
                  <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Correo electrónico</label>
                  <input type="email" formControlName="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="name@company.com" required />
              </div>
              <div>
                  <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contraseña</label>
                  <input type="password" formControlName="password" id="password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required />
              </div>
              <div class="flex items-end">
                  <a href="#" class="ms-auto text-sm text-blue-700 hover:underline dark:text-blue-500">Olvidaste la contraseña?</a>
              </div>
              <div class="mt-3"></div>
              <app-btn-primary label="Ingresar" type="submit" [disabled]="!loginForm.valid" (btnCliked)="OnSubmit()" 
              [loading]="loading" />
              <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
                  No tienes cuenta? <a routerLink="/register" class="text-blue-700 hover:underline dark:text-blue-500">Crear</a>
              </div>
          </form>
      </div>

    </div>
    
  `,
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
  loginForm: FormGroup;
  loading: boolean = false;

  constructor(
    private userServ: UserService,
    private toastServ: ToastService,
    private router: Router
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    });
  }

  OnSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;

      const values = this.loginForm.value;
      this.userServ.login(values).subscribe({
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
}
