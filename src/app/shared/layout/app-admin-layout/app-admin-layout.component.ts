import { Component, effect, OnInit } from '@angular/core';
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
  sections!: ISectionSidebar[];

  constructor(
    private sidebarServ: SidebarService
  ) {
    effect(() => {
      const data = this.sidebarServ.sections().get(2);
      if (data) {
        this.sections = data;
      }
    })
  }

  async ngOnInit() {
    this.sidebarServ.isExpanded$.subscribe(value => {
      this.isCollapsed = value;
    });
    this.sidebarServ.setSections(2, this.sectionsData);
  }

  get sectionsData(): ISectionSidebar[] {
    return [
      {
        id: 1,
        name: "Modulos",
        items: [
          {
            id: 1,
            title: "Eventos",
            url: "/admin/events/",
            actived: true
          },
          {
            id: 2,
            title: "Ordenes",
            url: "/admin/orders/",
            actived: false
          }
        ]
      }
    ]
  }

}