import { Component, input } from '@angular/core';
import { EventModel } from '../../../models';
import { CommonModule } from '@angular/common';
import { BtnPrimaryComponent } from "../../../components/btn-primary/btn-primary.component";

@Component({
  selector: 'app-events-card',
  standalone: true,
  imports: [CommonModule, BtnPrimaryComponent],
  templateUrl: './events-card.component.html',
  styles: `
    .bg-card {
      background: var(--bg-third-color);
    }
  `
})
export class EventsCardComponent {

  event = input.required<EventModel>();

  compareToDate(date: Date): boolean {
    const now = new Date();
    return date <= now; 
  }

  isToday(date: Date): boolean {
    const now = new Date();
    return date > now;
  }

}
