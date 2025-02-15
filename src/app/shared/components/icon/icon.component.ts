import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  imports: [],
  templateUrl: './icon.component.html',
  styles: ``
})
export class IconComponent {
  @Input() name!: string;
  @Input() width: number = 24;
  @Input() height: number = 24;
}
