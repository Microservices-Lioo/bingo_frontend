import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, RouterOutlet],
  template:  `
    <app-header /> 
    <div class="content">
      <router-outlet />
    </div>
  `,
  styles: [`
    .content {
      margin-top: 4rem; 
      height: calc(100vh - 4rem);
      overflow: auto;
    }
  `],
})
export class AppComponent implements OnInit {
  title = 'bingo_fronted';

  ngOnInit(): void {
    initFlowbite();
  }
}
