import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-ball',
  imports: [],
  template: `

  `,
  styles: `
  .loader {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    position: relative;
    box-shadow: 0 0 5px 1px #14294a inset,
        0 5px 5px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    font-size: 75%;
  }
  `
})
export class BallComponent implements OnChanges {
  @Input() value!: number;
  @Input() statu: boolean = true;
  @Output() btnCliked = new EventEmitter<String>();

  ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes)
  }
}
