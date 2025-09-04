import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { IAward } from '../../interfaces';
import { initFlowbite } from 'flowbite'

@Component({
  selector: 'app-list-view',
  imports: [],
  templateUrl: './list-view.component.html',
  styles: ``,
  standalone: true
})
export class ListViewComponent implements AfterViewInit  {
  @Input() listAwards!: IAward[];  

  ngAfterViewInit () {
    initFlowbite();
  }
}
