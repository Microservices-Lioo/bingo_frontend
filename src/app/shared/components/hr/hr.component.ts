import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-hr',
  imports: [],
  template: `
  <div class="relative w-full">
    <div class="inline-flex items-center justify-center w-full">
      <hr [class]="getColorHr()" class="w-full h-px my-3 border-0">
      <span [class]="getClassSpan()" 
        class="absolute px-3 font-medium  -translate-x-1/2 left-1/2">
        @if (type === 'a') {
          <a class="cursor-pointer" (click)="this.clicked.emit()">{{text}}</a>
        } @else {
          {{text}}
        }
      </span>
    </div>
  </div>
  `,
  styles: ``
})
export class HrComponent {
  @Input() type: 'a' | 'span' = 'span'
  @Input() text: string = '';
  @Input() color: string = '';
  @Input() bgText: string = '';
  @Output() clicked = new EventEmitter<String>();

  getClassSpan(): string {
    const bg = this.bgText != '' ? `bg-${this.bgText}` : 'bg-[#14294a]';
    return bg + ' ' + this.getColorSpan();
  }

  getColorHr(): string {
    return this.color != '' ? `bg-${this.color}` : 'bg-[#14294a]';
  }

  getColorSpan(): string {
    return this.color != '' ? `text-${this.color}` : 'text-[#14294a]';
  }
}
