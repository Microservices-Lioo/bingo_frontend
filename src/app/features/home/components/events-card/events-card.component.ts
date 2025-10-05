import { Component, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/services';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IEventWithBuyer, IUserShared } from '../../../../shared/interfaces';
import { CustomButtonComponent } from "../../../../shared/components/ui/button/custom-button.component";
import { CardsServiceShared } from '../../../../shared/services';

@Component({
  selector: 'app-events-card',
  standalone: true,
  imports: [CommonModule, IconComponent, RouterLink, CustomButtonComponent],
  templateUrl: './events-card.component.html'
})
export class EventsCardComponent implements OnInit {
  isSession: boolean = false;
  currentUser: IUserShared | undefined;
  event = input.required<IEventWithBuyer>();
  numberCards = 0;

  constructor(
    private authServ: AuthService,
    protected route: ActivatedRoute,
    private cardServ: CardsServiceShared
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
    this.cardServ.numberCardsToUserFromEvent(this.event().id).subscribe({
      next: (cant) => this.numberCards = cant,
      error: (error) => {
        console.error(error);
      }
    })
  }

}
