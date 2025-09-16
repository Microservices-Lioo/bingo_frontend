import { Component, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template:  ` <router-outlet /> `,
})
export class AppComponent implements OnInit {
  title = 'Mi Bingo';

  ngOnInit(): void {
    initFlowbite();
  }
}
