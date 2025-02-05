import { RouterLink } from '@angular/router';
import { Component, inject } from '@angular/core';
import { EventService } from '../../../events/services/event.service';
import { EventModel } from '../../../events/models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sidebar.component.html',
  styles: `
    .bg-sidebar {
      background: var(--bg-primary-color);
    }
  `
})
export class SidebarComponent {

  eventServ = inject(EventService);

  get eventList(): EventModel[] {
    return this.eventServ.eventList().filter(data => data.status == 'active');
  }
}
