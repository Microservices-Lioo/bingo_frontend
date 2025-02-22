import { RouterOutlet } from '@angular/router';
import { Component } from '@angular/core';
import { SidebarComponent } from '../components/sidebar/sidebar.component';

@Component({
  selector: 'app-home-sidebar',
  imports: [SidebarComponent, RouterOutlet],
  template: `
    <!-- Sidebar -->
    <app-sidebar />
    <div class="p-4 sm:ml-64">
      <router-outlet />
    </div>
  `,
  styles: ``
})
export class HomeSidebarComponent {

}
