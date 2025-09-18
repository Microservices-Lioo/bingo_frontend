import { Component, effect, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { IPagination } from '../../../core/interfaces';
import { StatusEvent } from '../../enums';
import { ISectionSidebar, IEventWithBuyer } from '../../interfaces';
import { EventServiceShared } from '../../services';
import { SidebarComponent } from '../app-sidebar/app-sidebar.component';
import { HeaderComponent } from '../app-header/app-header.component';
import { SidebarService } from '../../services/sidebar.service';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
  ],
  templateUrl: './app-layout.component.html',
  styles: ``
})
export class AppLayoutComponent implements OnInit {
  sections: ISectionSidebar[] = [];
  isCollapsed = true;

  constructor(
    private eventServ: EventServiceShared,
    private sidebarServ: SidebarService
  ) {
    effect(() => {
      const data = this.sidebarServ.sections().get(1);
      if (data) {
        this.sections = data;
      }
    })
  }

  async ngOnInit() {
    const data = await this.getEvents();
    const sectionsData = [
      {
        id: 1,
        name: "En directo",
        items: data.data.map((data, index) => (
          {
            id: (index + 1),
            title: data.name,
            description: data.description,
            url: 'event-detail',
            params: { id: data.id },
            actived: index === 0 ? true : false
          }
        ))
      }
    ];

    this.sidebarServ.setSections(1, sectionsData);

    this.sidebarServ.isExpanded$.subscribe(value => {
      this.isCollapsed = value;
    })
  }

  // Obtener los eventos de activos
  async getEvents(): Promise<IPagination<IEventWithBuyer>> {
    const events = await firstValueFrom(
      this.eventServ.eventListStatus(StatusEvent.ACTIVE, {})
    );
    return events;
  }

}