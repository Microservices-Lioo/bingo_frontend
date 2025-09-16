import { Component, OnInit } from '@angular/core';
import { ISectionSidebar } from '../../interfaces';
import { SidebarComponent } from '../app-sidebar/app-sidebar.component';
import { HeaderComponent } from '../app-header/app-header.component';
import { SidebarService } from '../../services/sidebar.service';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
  ],
  templateUrl: './app-admin-layout.component.html',
  styles: ``
})
export class AppAdminLayoutComponent implements OnInit {
  isCollapsed = true;

  constructor(
    private sidebarServ: SidebarService
  ) { }

  async ngOnInit() {
    this.sidebarServ.isExpanded$.subscribe(value => {
      this.isCollapsed = value;
    })
  }

  get sections(): ISectionSidebar[] {
    return [
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

}