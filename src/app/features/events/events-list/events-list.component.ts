import { Component, inject, OnInit } from '@angular/core';
import { EventsCardComponent } from "../events-card/events-card.component";
import { EventModel } from '../models';
import { EventService } from '../services/event.service';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [EventsCardComponent],
  templateUrl: './events-list.component.html',
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
