import { InputController } from "./InputController";

export class RangeInputController extends InputController<number> {
  private _value: number;

  constructor(selector: string) {
    super(selector);

    this._value = this.inputElement.valueAsNumber;

    this.setCustomValueAttribute(this._value);

    this.inputElement.addEventListener('input', event => {
      const newValue = (event.target as HTMLInputElement)?.valueAsNumber;

      this._value;
      this.setCustomValueAttribute(newValue);
    });
  }

  private setCustomValueAttribute(newValue: number | string) {
    this.inputElement.setAttribute('data-value', newValue.toString());
  }

  public get value() {
    return Number.parseFloat(this.inputElement.value);
  }

  public set value(newValue: number) {
    if (this._value === newValue) return;
    this._value = newValue;
    this.inputElement.valueAsNumber = newValue;
    this.setCustomValueAttribute(newValue);
  }
}
