import { Component } from '@angular/core';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { ISectionSidebar } from '../../shared/interfaces';
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-admin',
  imports: [SidebarComponent, RouterOutlet],
  templateUrl: './admin.component.html',
  styles: ``
})
export class AdminComponent {


  // Sidebar
  sections: ISectionSidebar[] = [
    {
      name: "Modulos",
      items: [
        {
          title: "Eventos",
          url: "/admin/events/"
        },
        {
          title: "Juegos",
          url: "/admin/games/"
        },
        {
          title: "Tablas",
          url: "/admin/cards/"
        },
        {
          title: "Ordenes",
          url: "/admin/orders/"
        }
      ]
    }
  ] 
  
}
