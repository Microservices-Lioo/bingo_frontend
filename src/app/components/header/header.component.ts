import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { BtnPrimaryComponent } from "../btn-primary/btn-primary.component";
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserModel } from '../../models';
import { Subscription } from 'rxjs';

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
export class HeaderComponent implements OnInit, OnDestroy {
  sesion = false;
  user: UserModel | any = null;
  private userSubscription: Subscription | undefined; 

  constructor(
    private userServ: UserService,
  ){}

  ngOnInit() {
    this.userSubscription = this.userServ.currentUser$.subscribe(user => {
      if (localStorage.getItem('user') && localStorage.getItem('access_token')
        && localStorage.getItem('refresh_token')) {
        this.sesion = true;
        this.user = JSON.parse(localStorage.getItem('user')!);
      }
    });    
  }

  ngOnDestroy() {
    if ( this.userSubscription ) {
      this.userSubscription.unsubscribe();
    }
  }

  logOut() {
    this.userServ.logOut();
    this.user = null;
    this.sesion = false;
  }


}
