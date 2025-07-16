import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  imports: [],
  template: `
  <div class="text-center">
    <div
      class="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-green-500 mx-auto"
    ></div>
    @if(textLoading) {
      <h2 class="text-zinc-900 dark:text-white mt-1 text-xs">{{ textLoading }}</h2>
    }
    @if(textMsg) {
      <p class="text-xs text-zinc-600 dark:text-zinc-400">
        {{ textMsg }}
      </p>
    }
  </div>
  `,
  styles: ``
})
export class LoadingComponent {
  @Input() textLoading: string | null = null;
  @Input() textMsg: string | null = null;
}
