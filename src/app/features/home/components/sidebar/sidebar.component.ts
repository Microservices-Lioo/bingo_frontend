import { RouterLink } from '@angular/router';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { EventService } from '../../../../shared/services/event.service';
import { EventInterface } from '../../../../core/interfaces';
import { initFlowbite, TooltipInterface } from 'flowbite';
import { TooltipComponent } from '../../../../shared/components/tooltip/tooltip.component';
import { TooltipsService } from '../../../../shared/services/tooltips.service';
import { AuthService } from '../../../auth/services';
import { StatusEvent } from '../../../../shared/enums';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, TooltipComponent],
  templateUrl: './sidebar.component.html',
  styles: `
    .bg-sidebar {
      background: var(--bg-primary-color);
    }
  `
})
export class SidebarComponent implements AfterViewInit, OnInit {
  isSession: boolean = false;
  eventListNow: EventInterface[] = [];
  eventListToday: EventInterface[] = [];
  toolTip: TooltipInterface | null = null;
  isShowMore: boolean = true;
  isShowLess: boolean = false;
  isShowMoreToday: boolean = true;
  isShowLessToday: boolean = false;
  limit: number = 5;
  page: number = 1;
  pageToday: number = 1;

  constructor(
    private authServ: AuthService,
    private eventServ: EventService,
    private toolTipServ: TooltipsService
  ) {}

  ngOnInit() {    
    this.authServ.isLoggedIn$.subscribe({
      next: (value) => {
        this.isSession = value;
        const pagination = { limit: this.limit, page: this.page};
        const paginationToday = { limit: this.limit, page: this.pageToday};
        this.resetValues();
        if (!value) {
          this.eventServ.eventListStatus(StatusEvent.NOW, pagination).subscribe({
            next: (eventList) => {
              this.eventListNow = eventList.data;
            },
            error: (error) => {
              console.log(error);
            }
          });
          this.eventServ.eventListStatus(StatusEvent.TODAY, paginationToday).subscribe({
            next: (eventList) => {
              this.eventListToday = eventList.data;
            },
            error: (error) => {
              console.log(error);
            }
          });
        } else {
          this.eventServ.eventListByUserStatus(StatusEvent.NOW, pagination).subscribe({
            next: (eventList) => {
              this.eventListNow = eventList.data;
            },
            error: (error) => {
              console.log(error);
            }
          });
          this.eventServ.eventListByUserStatus(StatusEvent.TODAY, paginationToday).subscribe({
            next: (eventList) => {
              this.eventListToday = eventList.data;
            },
            error: (error) => {
              console.log(error);
            }
          });
        }
      },
    });
  }
  
  ngAfterViewInit() {
    initFlowbite();
  }

  resetValues() {
    this.eventListNow = [];
    this.eventListToday = [];
    this.isShowMore = true;
    this.isShowLess = false;
    this.isShowMoreToday = true;
    this.isShowLessToday = false;
    this.page = 1;
    this.pageToday = 1;
  }

  viewToolTip(id: number) {
    if (this.toolTip) {
      this.toolTip = null;
    }
    const tool = this.toolTipServ.createToolTip('tooltip-'+id, 'tooltip-ctx'+id);
    if (!tool) return;
    this.toolTip = tool;
  }

  showMore() {
    this.page++;
    const pagination = { limit: this.limit, page: this.page};
    if (!this.isSession) {
      this.eventServ.eventListStatus(StatusEvent.NOW, pagination).subscribe({
        next: (eventList) => {
          if (eventList.data.length === 0) {
            this.page--;
            this.isShowMore = false;
          } else {
            this.isShowLess = true;
            this.eventListNow = [...this.eventListNow, ...eventList.data];
          }
        },
        error: (error) => {
          this.page++;
        }
      });
    } else {
      this.eventServ.eventListByUserStatus(StatusEvent.NOW ,pagination).subscribe({
        next: (eventList) => {
          if (eventList.data.length === 0) {
            this.page--;
            this.isShowMore = false;
          } else {
            this.isShowLess = true;
            this.eventListNow = [...this.eventListNow, ...eventList.data];
          }
        },
        error: (error) => {
          this.page++;
        }
      });
    }
  }

  showLess() {
    if (this.page == 1) return;

    this.page--;
    const init = (this.limit * this.page) - this.limit;
    const end = this.limit * this.page;
    const events = this.eventListNow.slice(init, end);
    this.eventListNow = [];
    this.eventListNow = events;
    
    if (this.page == 1) {
      this.isShowLess = false;
      this.isShowMore = true;
    }
  }

  showMoreToday() {
    this.pageToday++;
    const pagination = { limit: this.limit, page: this.pageToday };
    if (!this.isSession) {
      this.eventServ.eventListStatus(StatusEvent.TODAY, pagination).subscribe({
        next: (eventList) => {
          if (eventList.data.length === 0) {
            this.pageToday--;
            this.isShowMoreToday = false;
          } else {
            this.isShowLessToday = true;
            this.eventListToday = [...this.eventListToday, ...eventList.data];
          }
        },
        error: (error) => {
          this.pageToday--;
        }
      });
    } else {
      this.eventServ.eventListByUserStatus(StatusEvent.TODAY, pagination).subscribe({
        next: (eventList) => {
          if (eventList.data.length === 0) {
            this.pageToday--;
            this.isShowMoreToday = false;
          } else {
            this.isShowLessToday = true;
            this.eventListToday = [...this.eventListToday, ...eventList.data];
          }
        },
        error: (error) => {
          this.pageToday--;
        }
      });
    }
  }

  showLessToday() {
    if (this.pageToday == 1) return;

    this.pageToday--;
    const init = (this.limit * this.pageToday) - this.limit;
    const end = this.limit * this.pageToday;
    const events = this.eventListToday.slice(init, end);
    this.eventListToday = [];
    this.eventListToday = events;
    
    if (this.pageToday == 1) {
      this.isShowLessToday = false;
      this.isShowMoreToday = true;
    }
  }

}
