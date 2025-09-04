import { LoadingService } from './../../../../shared/services/loading.service';
import { Component, Input, OnInit } from '@angular/core';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { IEventAwards } from '../../interfaces';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { ToastService } from '../../../../shared/services';
import { UserService } from '../../../profile/services';
import { CommonModule } from '@angular/common';
import { PrimaryButtonComponent } from '../../../../ui/buttons/primary-button/primary-button.component';
import { AuthService } from '../../../auth/services';

@Component({
  selector: 'app-view-event',
  imports: [CommonModule, IconComponent, RouterLink, PrimaryButtonComponent],
  templateUrl: './view-event.component.html',
  styles: ``,
  standalone: true
})
export class ViewEventComponent implements OnInit {
  @Input() eventWithAward: IEventAwards | null =  null;
  owner = 'Desconocido';
  letterOwner = 'D';
  winners: { id: string, name: string}[] = [];
  
  constructor(
    private router: Router,
    protected route: ActivatedRoute,
    private eventServ: EventService,
    private toastServ: ToastService,
    private userServ: UserService,
    private loadingServ: LoadingService,
    protected authServ: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(value => {
      this.loadingServ.loadingOn();
      const eventId = value.get('id');
      if (eventId) {
        this.getEventAward(eventId);
      } else {
        this.router.navigate(['..'], { relativeTo: this.route });
        this.loadingServ.loadingOff();
      }
    });
  }  

  // Obtener el evento con sus premios
  getEventAward(eventId: string) {
    this.eventServ.getEventWithAwards(eventId).subscribe({
      next: (event) => {
        if (!event) {
          this.loadingServ.loadingOff();
          return;
        }
        this.eventWithAward = event;
        this.getUser(event.userId);
        event.award.forEach((award) => {
          if (!award.winner) return;
          this.getWinner(award.winner);
        });
        this.loadingServ.loadingOff();
      },
      error: (error) => {
        this.router.navigate(['..', { relativeTo: this.route }]);
        this.toastServ.openToast('event-awards', 'danger', error.message);
        this.loadingServ.loadingOff();
      }
    })
  }

  // Obtener datos de un usuario
  getUser(userId: string) {
    this.userServ.getUser(userId).subscribe({
      next: (user) => {
        if (user) {
          const { name, lastname, ...data } = user;
          const username = name + ' ' + lastname;
          this.owner = username != this.owner ? username : this.owner;
          this.getLetter();
        }
      },
      error: (error) => {
        this.toastServ.openToast('get-owner', 'danger', 'Error al obtener el owner del evento');
      }
    });;
  }

  // Obtener los ganadores de los premios
  getWinner(userId: string) {
    this.userServ.getUser(userId).subscribe({
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

  // Unión de name y lastname de los usuario premiados
  getWinnerName(userId: string): string {
    const winner = this.winners.find(w => w.id === userId);
    return winner ? winner.name : 'Desconocido';
  }

  // Obtener la letra principal del usuario de su name y lastname
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

  // Ocultar y mostrar texto
  toggleText(event: Event, id: string) {
    const pElement = document.getElementById(id);
    if (pElement) {
      pElement.classList.toggle('truncate');
    }
  }
}
