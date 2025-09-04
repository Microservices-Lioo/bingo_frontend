import { RouterOutlet } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { LoadingIndicatorComponent } from '../../../shared/components/loading-indicator/loading-indicator.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { IEventWithBuyer, ISectionSidebar } from '../../../shared/interfaces';
import { EventServiceShared } from '../../../shared/services';
import { firstValueFrom } from 'rxjs';
import { StatusEvent } from '../../../shared/enums';
import { IPagination } from '../../../core/interfaces';

@Component({
  selector: 'app-home-sidebar',
  imports: [SidebarComponent, RouterOutlet, LoadingIndicatorComponent],
  template: `
    <!-- Sidebar -->
    <app-sidebar [sections]="sections"/>
    <div class="p-4 sm:ml-64 h-full">
      <router-outlet />
      <app-loading-indicator />
    </div>
  `,
  styles: ``
})
export class HomeSidebarComponent implements OnInit {
  sections: ISectionSidebar[] = [];

  constructor( private eventServ: EventServiceShared) {}

  async ngOnInit() {
    const data =  await this.getEvents();
    this.sections = [
      {
        name:  "En directo",
        items: data.data.map( data => (
          { 
            title: data.name, 
            description: data.description, 
            url: 'event-detail',
            params: { id: data.id },
          }
        ))
      }
    ]
  }

  // Obtener los eventos de activos
  async getEvents(): Promise<IPagination<IEventWithBuyer>> {
    const events = await firstValueFrom(
      this.eventServ.eventListStatus(StatusEvent.PENDING, {})
    );
    return events;
  }
  

}
