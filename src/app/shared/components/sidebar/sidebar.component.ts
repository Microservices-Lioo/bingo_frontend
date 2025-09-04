import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { HrComponent } from '../hr/hr.component';
import { IItemSection, ISectionSidebar } from '../../interfaces';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [HrComponent],
  templateUrl: './sidebar.component.html',
  styles: `
    .bg-sidebar {
      background: var(--bg-primary-color);
    }
  `
})
export class SidebarComponent implements OnInit {
  @Input() sections: ISectionSidebar[] = [];

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
  ) {}

  ngOnInit() {
    initFlowbite();
    // const params = this.sections.map
    // this.authServ.isLoggedIn$.subscribe({
    //   next: (value) => {
    //     if (!value) {
    //       this.getEventsStatus(StatusEvent.ACTIVE, pagination);
    //     } else {
    //       this.getEventsByUserStatus(StatusEvent.ACTIVE, pagination);
    //     }
    //   },
    // });
  }

  navigationTo(item: IItemSection) {
    let route = item.url;
    if (item.params) {
      this.router.navigate([item.url], { 
        queryParams: item.params,
        relativeTo: this.route,
      });
    } else {
      console.log('sin param')
      this.router.navigate([route], { relativeTo: this.route })
    }
  }
  // showMore() {
  //   if (!this.eventListActive) return;
  //   if (this.eventListActive && this.eventListActive.meta.page === this.eventListActive.meta.lastPage) return;
    
  //   const page = this.eventListActive.meta.page + 1;
  //   const pagination = { limit: this.limit, page: page };
  //   if (!this.isSession) {
  //     this.getEventsStatus(StatusEvent.ACTIVE, pagination);
  //     this.eventListActive.meta.page = + 1;
  //   } else {
  //     this.getEventsByUserStatus(StatusEvent.ACTIVE, pagination);
  //     this.eventListActive.meta.page = + 1;
  //   }
  // }

  // showLess() {    
  //   if (!this.eventListActive) return;
  //   if (this.eventListActive && this.eventListActive.meta.page === 1) return;

  //   this.eventListActive.meta.page = this.eventListActive.meta.page - 1;    
  //   const init = 0;
  //   const end = this.limit * this.eventListActive.meta.page;
  //   const events = this.eventListActive.data.slice(init, end);
  //   this.eventListActive.data = [];
  //   this.eventListActive.data = events;
  // }

}
