import { Component } from '@angular/core';
import { CustomButtonComponent } from "../../../../shared/components/ui/button/custom-button.component";

@Component({
  selector: 'app-cancel',
  imports: [CustomButtonComponent],
  template: `
    <div class="h-full w-full flex justify-center items-center">
      <div class="flex flex-col items-center justify-center text-sm w-[30rem] h-auto">
          <p class="font-medium text-lg text-red-500">No se proceso el pago</p>
          <h2 class="md:text-6xl text-4xl font-semibold text-gray-800">Compra cancelada</h2>
          <p class="text-base mt-4 text-gray-500">Error al procesar la orden de pago, intentalo nuevamente o contacta con soporte.</p>
          <div class="flex items-center gap-4 mt-6">
              <app-custom-button [url]="'/'" [type]="'button'" [label]="'Regresar al inicio'" />
          </div>
      </div>
    </div>
  `,
})
export class CancelComponent {

}
