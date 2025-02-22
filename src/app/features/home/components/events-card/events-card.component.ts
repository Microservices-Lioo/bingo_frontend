import { Component, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimaryButtonComponent } from '../../../../ui/buttons/primary-button/primary-button.component';
import { EventInterface, UserInterface } from '../../../../core/interfaces';
import { AuthService } from '../../../auth/services';
import { EventWithBuyerInterface } from '../../../../shared/services/event.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-events-card',
  standalone: true,
  imports: [CommonModule, PrimaryButtonComponent, IconComponent, RouterLink],
  templateUrl: './events-card.component.html',
  styles: `
    .bg-card {
      background: var(--bg-third-color);
    }
  `
})
export class EventsCardComponent implements OnInit {
  isSession: boolean = false;
  currentUser: UserInterface | undefined;
  event = input.required<EventWithBuyerInterface>();

  constructor(
    private authServ: AuthService
  ) {
    this.authServ.isLoggedIn$.subscribe( value => {
      this.isSession = value;
      if (value) {
        this.currentUser = this.authServ.currentUser;
      } else {
        this.currentUser = undefined;
      }
    });
  }

  ngOnInit() {
  }

  compareToDate(date: Date): boolean {
    const now = new Date();
    return date <= now; 
  }

  isToday(date: Date): boolean {
    const now = new Date();
    return date > now;
  }

}
