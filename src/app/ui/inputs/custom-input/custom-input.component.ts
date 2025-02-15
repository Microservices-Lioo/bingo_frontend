import { Component, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

export type InputType = 'text' | 'number' | 'tel' | 'email' | 'password' | 'datetime-local';

@Component({
  selector: 'app-custom-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './custom-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomInputComponent),
      multi: true,
    },
  ],
})
export class CustomInputComponent implements ControlValueAccessor {
  id = input<string>('');
  label = input<string>('');
  type = input<InputType>('text');
  placeholder = input<string>('');
  control = input.required<FormControl<any>>();
  disabled = input<boolean>(false);
  minDate = input<string>('');
  
  onTouched = () => { };
  onChange = (_value: any) => { };

  writeValue(value: any): void {
    if (value != this.control().value) {
      this.control().setValue(value, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.control().disable() : this.control().enable();
  }


}
