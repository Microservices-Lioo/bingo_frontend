import { Component, ContentChild, Input, OnInit, TemplateRef } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoadingService } from '../../services';
import { RouteConfigLoadEnd, RouteConfigLoadStart, Router,  } from '@angular/router';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-loading-indicator',
  imports: [AsyncPipe],
  template: `
  @if(loading$ | async ) {
      <div class="loader bg-gray-300 fixed w-full h-full flex justify-center items-center top-0 left-0">
        <div class="dot">B</div>
        <div class="dot">I</div>
        <div class="dot">N</div>
        <div class="dot">G</div>
        <div class="dot">O</div>
      </div>
  }
  `,
  styles: `
  .loader {
    margin-top: 4rem;
    z-index: 2000;
  }

  .loader .dot {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    border: 2px solid #e8e8e8;
    background: #16b0c1;
    animation: jump 0.8s ease-in-out infinite alternate;
    font-size: 10px;
    text: center;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  @keyframes jump {
    100% {
      background: #661e92;
      transform: translateZ(-3rem) scale(1.9);
    }
  }

  .loader .dot:nth-child(1) {
    animation-delay: 0.1s;
  }

  .loader .dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .loader .dot:nth-child(3) {
    animation-delay: 0.3s;
  }

  .loader .dot:nth-child(4) {
    animation-delay: 0.4s;
  }

  .loader .dot:nth-child(5) {
    animation-delay: 0.5s;
  }
  `,
  standalone: true
})
export class LoadingIndicatorComponent implements OnInit {
  loading$: Observable<boolean>;

  @Input() detectRouteTransitions = false;

  constructor(
    private loadingServ: LoadingService,
    private router: Router
  ) {
    this.loading$ = this.loadingServ.loading$;
  }

  ngOnInit() {
    if (this.detectRouteTransitions) {
      this.router.events
        .pipe(
          tap((event)=> {
            if (event instanceof RouteConfigLoadStart) {
              this.loadingServ.loadingOn();
            } else if (event instanceof RouteConfigLoadEnd) {
              this.loadingServ.loadingOff();
            }
          })
        )
        .subscribe();
    }
  }
}
