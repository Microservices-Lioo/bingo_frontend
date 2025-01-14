import { RouterLink } from '@angular/router';
import { EventModel } from '../../models';
import { EventService } from './../../services/event.service';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink],
  template: `
    
    <button data-drawer-target="separator-sidebar" data-drawer-toggle="separator-sidebar" aria-controls="separator-sidebar" type="button" class="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
      <span class="sr-only">Open sidebar</span>
      <svg class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path clip-rule="evenodd" fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
      </svg>
    </button>

    <aside id="separator-sidebar" class="fixed top-0 left-0 z-40 w-64 h-screen pt-12 transition-transform -translate-x-full bg-sidebar border-r border-[#14294a] sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700" aria-label="Sidebar">
      <div class="h-full px-3 py-5  bg-sidebar dark:bg-gray-800">
          <ul class="space-y-2 font-medium">
            <span class="self-center text-xl font-semibold whitespace-nowrap text-white">Para tí</span><br>
            <span class="self-center text-xl font-semibold whitespace-nowrap text-white">Eventos de hoy</span>
            @for (ev of eventList; track $index) {
              <li>
                  <a [attr.data-popover-target]="'popover-right-'+ $index" data-popover-placement="right" routerLink="/" class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-700 dark:hover:bg-gray-700 group">
                    <svg class="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
                        <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z"/>
                    </svg>
                    <div class="w-56 flex">
                      <div class="w-40">
                        <span class="ms-3 text-white">{{ ev.name }}</span><br>
                        <p class="ms-3 text-sm text-gray-500 truncate ...">{{ ev.description }}</p>
                      </div>
                      <div class="flex flex-row justify-center items-center">
                        <span class="flex w-3 h-3  bg-red-600 rounded-full"></span>
                        <span class="text-xs px-1 text-white">1.5K</span>
                      </div>
                    </div>
                  </a>
                  <div data-popover [id]="'popover-right-' + $index" role="tooltip" class="absolute z-10 invisible inline-block w-64 text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm opacity-0 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800">
                    <div class="px-3 py-2 bg-gray-100 border-b border-gray-200 rounded-t-lg dark:border-gray-600 dark:bg-gray-700">
                        <h3 class="font-semibold text-gray-900 dark:text-white">{{ ev.name }}</h3>
                    </div>
                    <div class="px-3 py-2">
                        <p>{{ ev.description }}And here's some amazing content. It's very engaging. Right?</p>
                    </div>
                    <div data-popper-arrow></div>
                </div>
              </li>
            }
            
          </ul>
      </div>
    </aside>

  `,
  styles: `
    .bg-sidebar {
      background: var(--bg-primary-color);
    }
  `
})
export class SidebarComponent {

  eventServ =  inject(EventService);

  get eventList(): EventModel[] {
      return this.eventServ.eventList().filter(data => data.status == 'active');
    }
}
