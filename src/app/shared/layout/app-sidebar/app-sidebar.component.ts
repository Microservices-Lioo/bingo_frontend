import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { IItemSection, ISectionSidebar } from '../../interfaces';
import { HrComponent } from '../../components/hr/hr.component';
import { SidebarService } from '../../services/sidebar.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [HrComponent, NgClass],
  templateUrl: './app-sidebar.component.html'
})
export class SidebarComponent implements OnInit {
  @Input() sections: ISectionSidebar[] = [];
  @Input() id: number = 0;
  isCollapsed = true;

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    private sidebarServ: SidebarService
  ) { }

  ngOnInit() {
    initFlowbite();
    this.sidebarServ.isExpanded$.subscribe(value => {
      this.isCollapsed = value;
    })
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

  navigationTo(idSection: number, item: IItemSection) {
    let route = item.url;
    if (item.params) {
      this.activeSection(idSection, item.id);
      this.router.navigate([item.url], {
        queryParams: item.params,
        relativeTo: this.route,
      });
    } else {
      this.activeSection(idSection, item.id);
      this.router.navigate([route], { relativeTo: this.route })
    }
  }

  activeSection(idSection: number, idItem: number) {
    if (this.id === 0) return;
    this.sidebarServ.setActivedItem(this.id, idSection, idItem);
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
