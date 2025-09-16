import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IUser } from '../../../../core/interfaces';
import { AuthService } from '../../../auth/services';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IEventWithBuyer } from '../../../../shared/interfaces';
import { CustomButtonComponent } from "../../../../shared/components/ui/button/custom-button.component";

@Component({
  selector: 'app-events-card',
  standalone: true,
  imports: [CommonModule, IconComponent, RouterLink, CustomButtonComponent],
  templateUrl: './events-card.component.html'
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
