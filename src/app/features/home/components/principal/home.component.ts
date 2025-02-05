import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { EventsListComponent } from '../../../events/events-list/events-list.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SidebarComponent, EventsListComponent, RouterLink],
  templateUrl: './home.component.html',
  styles: ``
})
export class HomeComponent {

}
