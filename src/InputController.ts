export abstract class InputController<Value> {
  constructor(selector: string) {
    this.inputElement = document.querySelector(selector) as HTMLInputElement;
  }

  protected inputElement: HTMLInputElement;

  public abstract get value(): Value;
}

export class RangeInputController extends InputController<number> {
  constructor(selector: string) {
    super(selector);

    this.setCustomValueAttribute(this.inputElement.value);

    this.inputElement.addEventListener('change', event => {
      this.setCustomValueAttribute((event.target as HTMLInputElement)?.value);
    });
  }

  private setCustomValueAttribute(newValue: number | string) {
    this.inputElement.setAttribute('data-value', newValue.toString());
  }

  public get value() {
    return Number.parseFloat(this.inputElement.value);
  }
}
