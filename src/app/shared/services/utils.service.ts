import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(
    private router: Router
  ) { }

  //* Reirigir al usuario indicando que la pagina esta protegida
  goForbidden() {
    this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        take(1)
    ).subscribe(() => {
        this.router.navigate(['/forbidden']);
    });
    
    if (!this.router.navigated) {
        this.router.navigate(['/forbidden']);
    }
  }
}
