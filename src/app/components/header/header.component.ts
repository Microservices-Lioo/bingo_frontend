import { Component, OnInit } from '@angular/core';
import { BtnPrimaryComponent } from "../btn-primary/btn-primary.component";
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserInterface } from '../../interfaces';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [BtnPrimaryComponent, RouterLink],
  templateUrl: './header.component.html',
  styles: `
    .bg-header {
      background: var(--bg-primary-color);
    }
  `
})
export class HeaderComponent implements OnInit {
  sesion = false;
  user: UserInterface | any = null;

  constructor(  
    private userServ: UserService,
  ){}

  ngOnInit() {
    this.userServ.isLoggedIn$.subscribe(value => {
      this.sesion = value;
      this.user = this.userServ.currentUser;
    });
  }

  logOut() {
    this.userServ.logOut();
    this.user = null;
  }

}
