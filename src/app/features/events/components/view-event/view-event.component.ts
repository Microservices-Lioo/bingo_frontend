import { LoadingService } from './../../../../shared/services/loading.service';
import { Component, Input, OnInit } from '@angular/core';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { EventAwardsInterface } from '../../interfaces';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { ToastService } from '../../../../shared/services';
import { UserService } from '../../../profile/services';
import { CommonModule } from '@angular/common';
import { PrimaryButtonComponent } from '../../../../ui/buttons/primary-button/primary-button.component';

@Component({
  selector: 'app-view-event',
  imports: [CommonModule, IconComponent, RouterLink, PrimaryButtonComponent],
  templateUrl: './view-event.component.html',
  styles: ``,
  standalone: true
})
export class ViewEventComponent implements OnInit {
  @Input() eventWithAward!: EventAwardsInterface;
  owner = 'Desconocido';
  letterOwner = '';
  winners: { id: number, name: string}[] = [];
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private eventServ: EventService,
    private toastServ: ToastService,
    private userServ: UserService,
    private loadingServ: LoadingService
  ) {}

  ngOnInit() {
    this.loadingServ.loadingOn();
    if (!this.eventWithAward) {
      this.route.paramMap.subscribe(value => {
        const eventId = value.get('id');
        if (eventId) {
          this.getEventAward(+eventId);
        } else {
          this.router.navigate(['/', '/home/principal']);
          this.loadingServ.loadingOff();
        }
      });
    } else {
      this.loadingServ.loadingOff();
    }
  }  

  getEventAward(eventId: number) {
    this.eventServ.getEventWithAwards(eventId).subscribe({
      next: (event) => {
        if (!event) {
          this.loadingServ.loadingOff();
          return;
        }
        this.eventWithAward = event;
        this.getOwner(event.userId);
        event.award.forEach((award) => {
          if (award.winner_user === null) return;
          this.getWinner(award.winner_user);
        });
        this.loadingServ.loadingOff();
      },
      error: (error) => {
        this.router.navigate(['/', '/home/principal']);
        this.toastServ.openToast('event-awards', 'danger', error.message);
        this.loadingServ.loadingOff();
      }
    })
  }

  getUser(userId: number) {
    return this.userServ.getUser(userId);
  }

  getOwner(userId: number) {
    let ownerName = 'Desconocido';
    this.getUser(userId).subscribe({
      next: (user) => {
        if (user) {
          const { name, lastname, ...data } = user;
          const username = name + ' ' + lastname;
          this.owner = username != this.owner ? username : this.owner;
          ownerName = this.owner;
          this.getLetter();
        }
      },
      error: (error) => {
        this.toastServ.openToast('get-owner', 'danger', 'Error al obtener el owner del evento');
      }
    });
  }

  getWinner(userId: number) {
    this.getUser(userId).subscribe({
      next: (user) => {
        if (user) {
          const { name, lastname, ...data } = user;
          let winner = name + ' ' + lastname;
          this.winners.push({ id: userId, name: winner });
        }
      },
      error: (error) => {
        this.toastServ.openToast('get-winner', 'danger', 'Error al cargar los ganadores');
      }
    });
  }

  getWinnerName(userId: number): string {
    const winner = this.winners.find(w => w.id === userId);
    return winner ? winner.name : 'Desconocido';
  }

  getLetter() {
    let letter = '';
    const arrayOwner = this.owner.split(' ');
    if (arrayOwner.length > 2 ) {
      arrayOwner.forEach((name, index) => {
        if (index === 0 || index === 2 ) {
          const arrayLetter = name.split('');
          letter = letter + arrayLetter[0];
        }
      });
    } else {
      arrayOwner.forEach(name => {
        const arrayLetter = name.split('');
        letter = letter + arrayLetter[0];
      });
    }
    this.letterOwner = letter;
  }

  toggleText(event: Event, id: string) {
    const pElement = document.getElementById(id);
    if (pElement) {
      pElement.classList.toggle('truncate');
    }
  }
}
