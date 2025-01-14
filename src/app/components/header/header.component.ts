import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { BtnPrimaryComponent } from "../btn-primary/btn-primary.component";
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserModel } from '../../models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [BtnPrimaryComponent, RouterLink],
  template: `
    <nav class="fixed top-0 z-50 w-full bg-header border-b border-[#14294a]">
      <div class="px-3 py-3 lg:px-5 lg:pl-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center justify-start rtl:justify-end">
            <button data-drawer-target="logo-sidebar" data-drawer-toggle="logo-sidebar" aria-controls="logo-sidebar" type="button" class="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
                <span class="sr-only">Open sidebar</span>
                <svg class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path clip-rule="evenodd" fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                </svg>
            </button>
            <a routerLink="home" class="flex ms-2 md:me-24">
              <img src="https://flowbite.com/docs/images/logo.svg" class="h-8 me-3" alt="FlowBite Logo" />
              <span class="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap text-white">Mi Bingo</span>
            </a>
          </div>
          <div class="flex items-center">
            @if ( !sesion ) {
            <app-btn-primary label="Ingresar" routerLink="/auth"/>
            } @else {
              <div class="flex items-center ms-3">
                <div>
                  <button type="button" class="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" aria-expanded="false" data-dropdown-toggle="dropdown-user">
                    <span class="sr-only">Open user menu</span>
                    <img class="w-8 h-8 rounded-full" src="https://flowbite.com/docs/images/people/profile-picture-5.jpg" alt="user photo">
                  </button>
                </div>
                <div class="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600" id="dropdown-user">
                  <div class="px-4 py-3" role="none">
                    <p class="text-sm text-gray-900 dark:text-white" role="none">
                      {{ user.name || '' }}
                    </p>
                    <p class="text-sm font-medium text-gray-900 truncate dark:text-gray-300" role="none">
                      {{ user.email || '' }}
                    </p>
                  </div>
                  <ul class="py-1" role="none">
                    <li>
                      <a href="profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Perfil</a>
                    </li>
                    <li>
                      <a routerLink="my-events" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Mis Eventos</a>
                    </li>
                    <li>
                      <a (click)="logOut()" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Salir</a>
                    </li>
                  </ul>
                </div>
              </div>
              }
            </div>
        </div>
      </div>
    </nav>      
  `,
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
    private router: Router,
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
    this.router.navigate(['/', 'home']);
  }


}
