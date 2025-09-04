import { AfterViewInit, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../features/auth/services';
import { PrimaryButtonComponent } from '../../../ui/buttons/primary-button/primary-button.component';
import { IUser } from '../../../core/interfaces';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [PrimaryButtonComponent, RouterLink],
  templateUrl: './header.component.html',
  styles: `
    .bg-header {
      background: var(--bg-primary-color);
    }
  `
})
export class HeaderComponent implements OnInit {
  sesion = false;
  user: IUser | null = null;

  constructor(  
    private authServ: AuthService,
  ){}

  ngOnInit() {
    this.authServ.isLoggedIn$.subscribe(value => {
      if (value) {
        this.user = this.authServ.currentUser;
      }
      this.sesion = value;
    });
  }

  logOut() {
    this.authServ.logOut();
  }

}
