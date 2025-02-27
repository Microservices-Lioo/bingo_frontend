import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { PrimaryButtonComponent } from '../../../../ui/buttons/primary-button/primary-button.component';
import { UserInterface } from '../../../../core/interfaces';
import { LoadingService, ToastService } from '../../../../shared/services';
import { UserService } from '../../services';
import { AuthService } from '../../../auth/services';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [PrimaryButtonComponent],
  templateUrl: './profile.component.html',
  styles: ``
})
export class ProfileComponent implements OnInit {
  user: UserInterface | any = null;
  isLogged: boolean = false;

  constructor(
    private loadingServ: LoadingService,
    private router: Router,
    private route: ActivatedRoute,
    private userServ: UserService,
    private toastServ: ToastService,
    private authServ: AuthService
  ) {}

  ngOnInit() {
    this.loadingServ.loadingOn();
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {      
      this.user = this.authServ.currentUser;
      this.authServ.isLoggedIn$.subscribe( (logged) => {
        this.isLogged = logged;
      });
      this.loadingServ.loadingOff();
    } else {
      this.getUserOne(+id);
    }
  }

  getUserOne(id: number) {
    this.userServ.getUser(id).subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
          this.loadingServ.loadingOff();
        } else {
          this.router.navigate(['/home/principal']);
          this.toastServ.openToast('user', 'danger', 'El usuario no existe');
          this.loadingServ.loadingOff();
        }
      },
      error: (error) => {
        this.router.navigate(['/home/principal']);
        this.toastServ.openToast('user', 'danger', 'No se encontro los datos del usuario');
        this.loadingServ.loadingOff();
      }
    })
  }

  getLetter(): string {
    const arrayLetterName = this.user.name.split('');
    const arrayLetterLastname = this.user.lastname.split('');
    return arrayLetterName[0] + arrayLetterLastname[0];
  }


}
