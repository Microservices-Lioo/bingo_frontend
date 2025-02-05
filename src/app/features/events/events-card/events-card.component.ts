import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimaryButtonComponent } from '../../../ui/buttons/primary-button/primary-button.component';
import { EventModel } from '../models';

@Component({
  selector: 'app-events-card',
  standalone: true,
  imports: [CommonModule, PrimaryButtonComponent],
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
