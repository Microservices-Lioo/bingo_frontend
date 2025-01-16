import { Component } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { EventsListComponent } from "../events/events-list/events-list.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SidebarComponent, EventsListComponent, RouterLink],
  templateUrl: './home.component.html',
  styles: ``
})
export class HomeComponent {

}
