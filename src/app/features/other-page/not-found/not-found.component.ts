import { Component } from '@angular/core';
import { CustomButtonComponent } from "../../../shared/components/ui/button/custom-button.component";

@Component({
  selector: 'app-not-found',
  imports: [CustomButtonComponent],
  template: `
    <div class="flex flex-col items-center justify-center text-sm h-[400px]">
      <p class="font-medium text-lg text-sky-950">Error 404</p>
      <h2 class="md:text-6xl text-4xl font-semibold text-gray-800">Página no encontrada</h2>
      <p class="text-base mt-4 text-gray-500">Lo sentimos, no pudimos encontrar la página que estás buscando.</p>
      <div class="flex items-center gap-4 mt-6">
          <app-custom-button [url]="'/'" [type]="'button'" [label]="'Regresar al inicio'" />
        </div>
    </div>
  `,
  styles: ``
})
export class NotFoundComponent {

}
