import { Component, Input, OnInit } from '@angular/core';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { EventAwardsInterface } from '../../interfaces';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { ToastService } from '../../../../shared/services';
import { UserService } from '../../../profile/services';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-event',
  imports: [CommonModule, IconComponent, RouterLink],
  templateUrl: './view-event.component.html',
  styles: ``,
  standalone: true
})
export class ViewEventComponent implements OnInit {
  @Input() eventWithAward!: EventAwardsInterface;
  eventData: EventAwardsInterface = {
    id: 1,
    name: 'Torneo de Estrategia 2025',
    description:
      '¡Prepárate para el desafío definitivo! En el Torneo de Estrategia 2025, los mejores jugadores se enfrentarán en un emocionante duelo de habilidad, táctica y velocidad. Participa, demuestra tu talento y compite por increíbles premios.',
    price: 10,
    userId: 8,
    status: 'NOW',
    start_time: new Date(),
    award: [
      {
        id: 1,
        name: 'Primer lugar',
        description: 'Premio de $500 en efectivo y un trofeo exclusivo para el campeón del torneo.',
        eventId: 1,
        num_award: 1,
        gameId: 1,
        winner_user: 0, // Aún por determinar
      },
      {
        id: 2,
        name: 'Segundo lugar',
        description: 'Premio de $250 en efectivo y una medalla de plata para el subcampeón.',
        eventId: 1,
        num_award: 2,
        gameId: 1,
        winner_user: 0,
      },
      {
        id: 3,
        name: 'Tercer lugar',
        description: 'Premio de $100 en efectivo y una medalla de bronce para el tercer puesto.',
        eventId: 1,
        num_award: 3,
        gameId: 1,
        winner_user: 0,
      },
      {
        id: 4,
        name: 'Bonus especial',
        description: 'Acceso VIP al próximo evento con beneficios exclusivos para los finalistas.',
        eventId: 1,
        num_award: 4,
        gameId: 1,
        winner_user: 0,
      },
    ],
  };
  owner = 'Desconocido';
  winners: { id: number, name: string}[] = [];
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private eventServ: EventService,
    private toastServ: ToastService,
    private userServ: UserService
  ) {}

  ngOnInit() {
    if (!this.eventWithAward) {
      this.route.paramMap.subscribe(value => {
        const eventId = value.get('id');
        if (eventId) {
          this.getEventAward(+eventId);
        } else {
          this.router.navigate(['/', '/home/principal']);
        }
      });
    }
  }

  getEventAward(eventId: number) {
    this.eventServ.getEventWithAwards(eventId).subscribe({
      next: (event) => {
        if (!event) {
          return;
        }
        this.eventWithAward = event;
        this.getOwner(event.userId);
        event.award.forEach((award) => {
          if (award.winner_user === null) return;
          this.getWinner(award.winner_user);
        });
      },
      error: (error) => {
        this.router.navigate(['/', '/home/principal']);
        this.toastServ.openToast('event-awards', 'danger', error.message);
      }
    })
  }

  getUser(userId: number) {
    return this.userServ.getUser(userId);
  }

  getOwner(userId: number): string {
    let ownerName = 'Desconocido';
    this.getUser(userId).subscribe({
      next: (user) => {
        if (user) {
          const { name, lastname, ...data } = user;
          const username = name + ' ' + lastname;
          this.owner = username != this.owner ? username : this.owner;
          ownerName = this.owner;
        }
      },
      error: (error) => {
        return ownerName;
      }
    });
    return ownerName;
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
        console.log(error);
      }
    });
  }

  getWinnerName(userId: number): string {
    const winner = this.winners.find(w => w.id === userId);
    return winner ? winner.name : 'Desconocido';
  }

  getLetter(): string {
    let letter = '';
    const arrayOwner = this.owner.split(' ');
    arrayOwner.forEach(name => {
      const arrayLetter = name.split('');
      letter = letter + arrayLetter[0];
    });
    return letter;
  }

  toggleText(event: Event, id: string) {
    const pElement = document.getElementById(id);
    if (pElement) {
      pElement.classList.toggle('truncate');
    }
  }
}
