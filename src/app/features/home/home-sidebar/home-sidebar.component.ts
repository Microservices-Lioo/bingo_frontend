import { RouterOutlet } from '@angular/router';
import { Component } from '@angular/core';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { LoadingIndicatorComponent } from '../../../shared/components/loading-indicator/loading-indicator.component';

@Component({
  selector: 'app-home-sidebar',
  imports: [SidebarComponent, RouterOutlet, LoadingIndicatorComponent],
  template: `
    <!-- Sidebar -->
    <app-sidebar />
    <div class="p-4 sm:ml-64">
      <router-outlet />
      <app-loading-indicator />
    </div>
  `,
  styles: ``
})
export class HomeSidebarComponent {

}
