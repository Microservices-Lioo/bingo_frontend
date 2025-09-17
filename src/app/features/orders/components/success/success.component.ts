import { Component } from '@angular/core';
import { CustomButtonComponent } from "../../../../shared/components/ui/button/custom-button.component";

@Component({
  selector: 'app-success',
  imports: [CustomButtonComponent],
  template: `
    <div class="h-full w-full flex justify-center items-center">
      <div class="flex flex-col items-center justify-center text-sm w-[30rem] h-auto">
          <p class="font-medium text-lg text-green-500">Has obtenido tus tabla(s) de bingo </p>
          <h2 class="md:text-6xl text-4xl font-semibold text-gray-800">Compra completada</h2>
          <p class="text-base mt-4 text-gray-500">Ahora puedes participar en el evento. Tu compra se realizó con éxito, puedes
              revisar la orden de compra o regresar al inicio.</p>
          <div class="flex items-center gap-4 mt-6">
              <app-custom-button [url]="'admin/orders'" [type]="'button'" [label]="'Revisar ordenes'" />
              <app-custom-button [url]="'/'" [type]="'button'" [label]="'Regresar al inicio'" />
          </div>
      </div>
    </div>
  `,
})
export class SuccessComponent {

}
