import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tooltip',
  imports: [],
  template: `
    <div 
      [id]="'tooltip-ctx'+id" 
      role="tooltip" 
      class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
        {{description}}
        <div class="tooltip-arrow" data-popper-arrow></div>
    </div>
  `,
  styles: ``
})
export class TooltipComponent {
  @Input() id!: number | string;
  @Input() description: string = '';
}
