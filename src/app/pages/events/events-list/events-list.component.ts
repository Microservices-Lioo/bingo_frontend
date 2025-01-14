import { Component, inject, OnInit } from '@angular/core';
import { EventModel } from '../../../models';
import { EventsCardComponent } from "../events-card/events-card.component";
import { EventService } from '../../../services/event.service';

@Component({
  selector: 'app-events-list',
  imports: [EventsCardComponent],
  template: `
    <div>
      <div class="flex items-center justify-center py-4 md:py-8 flex-wrap">
          <button type="button" (click)="eventListAll()" class="text-gray-900 border border-white hover:border-b-blue-900 dark:border-gray-900 dark:bg-gray-900 dark:hover:border-gray-700 bg-white focus:outline-none focus:border-b-2 focus:border-b-blue-950 text-base font-medium px-5 py-2.5 text-center me-3 mb-3 dark:text-white dark:focus:ring-gray-800">Todos</button>
          <button type="button" (click)="eventListToday()" class="text-gray-900 border border-white hover:border-b-blue-900 dark:border-gray-900 dark:bg-gray-900 dark:hover:border-gray-700 bg-white focus:outline-none focus:border-b-2 focus:border-b-blue-950 text-base font-medium px-5 py-2.5 text-center me-3 mb-3 dark:text-white dark:focus:ring-gray-800">Hoy</button>
          <button type="button" (click)="eventListNow()" class="text-gray-900 border border-white hover:border-b-blue-900 dark:border-gray-900 dark:bg-gray-900 dark:hover:border-gray-700 bg-white focus:outline-none focus:border-b-2 focus:border-b-blue-950 text-base font-medium px-5 py-2.5 text-center me-3 mb-3 dark:text-white dark:focus:ring-gray-800">Ahora</button>
          <button type="button" (click)="eventListSchedule()" class="text-gray-900 border border-white hover:border-b-blue-900 dark:border-gray-900 dark:bg-gray-900 dark:hover:border-gray-700 bg-white focus:outline-none focus:border-b-2 focus:border-b-blue-950 text-base font-medium px-5 py-2.5 text-center me-3 mb-3 dark:text-white dark:focus:ring-gray-800">Próximos</button>
      </div>     

        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            @for (event of eventListF; track event.id) {
              <app-events-card [event]="event"/>
            }
        </div>
    </div>
    
  `,
  styles: ``
})
export class EventsListComponent implements OnInit {
  
  eventListF: EventModel[] = [];
  eventServ = inject(EventService);


  ngOnInit() {
    this.eventListF = this.eventServ.eventListActiveSchedule();
  }

  eventListAll() {
    this.eventListF = [];
    this.eventListF = this.eventServ.eventListActiveSchedule();
  }

  eventListNow() {
    this.eventListF = [];
    this.eventListF = this.eventServ.eventListActiveSchedule().filter( (even) => 
      even.status == "active" 
      && even.start_time.getTime() <= new Date().getTime());
  }

  eventListToday() {
    this.eventListF = [];
    this.eventListF = this.eventServ.eventList().filter(data => data.status == 'active');
  }

  eventListSchedule() {
    this.eventListF = [];
    this.eventListF =  this.eventServ.eventList().filter(data => data.status == 'scheduled');
  }
}
