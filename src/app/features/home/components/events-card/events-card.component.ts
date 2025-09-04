import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimaryButtonComponent } from '../../../../ui/buttons/primary-button/primary-button.component';
import { IUser } from '../../../../core/interfaces';
import { AuthService } from '../../../auth/services';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IEventWithBuyer } from '../../../../shared/interfaces';

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
export class EventsCardComponent {
  isSession: boolean = false;
  currentUser: IUser | undefined;
  event = input.required<IEventWithBuyer>();

  constructor(
    private authServ: AuthService,
    protected route: ActivatedRoute
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

}
