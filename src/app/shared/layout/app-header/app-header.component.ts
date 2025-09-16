import { Component, effect, HostListener, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../features/auth/services';
import { IUser } from '../../../core/interfaces';
import { CustomButtonComponent } from "../../components/ui/button/custom-button.component";
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CustomButtonComponent],
  templateUrl: './app-header.component.html',
  styles: `
    .bg-header {
      background: var(--bg-primary-color);
    }
  `
})
export class HeaderComponent implements OnInit {
  sesion = false;
  user: IUser | null = null;
  expanded = true;
  isMobile = signal(false);

  // Escuchar cambios de tamaño de ventana
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkScreenSize();
  }

  constructor(  
    private authServ: AuthService,
    private sidebarServ: SidebarService
  ){
     // Verificar tamaño inicial
    this.checkScreenSize();

    // Effect para auto-manejar sidebar según tamaño de pantalla
    effect(() => {
      if (this.isMobile()) {
        this.sidebarServ.setExpanded(false);
        this.expanded = false;
      } else {
        this.sidebarServ.setExpanded(true);
        this.expanded = true;
      }
    });
  }

  ngOnInit() {
    this.authServ.isLoggedIn$.subscribe(value => {
      if (value) {
        this.user = this.authServ.currentUser;
      }
      this.sesion = value;
    });
  }

  private checkScreenSize() {
    // Tailwind md breakpoint: 768px
    this.isMobile.set(window.innerWidth < 768);
  }

  toggleMenu() {
    if (this.expanded) {
      this.sidebarServ.setExpanded(false);
      this.expanded = false;
    } else {
      this.sidebarServ.setExpanded(true);
      this.expanded = true;
    }
  }

  logOut() {
    this.authServ.logOut();
  }

}