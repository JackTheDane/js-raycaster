abstract class InputController<Value extends number | string> {
  protected _value: Value;

  constructor(protected inputElement: HTMLInputElement, protected onValueChanged?: (value: Value) => void) {
    this._value = this.inputElement.value as Value;

    this.inputElement.addEventListener('input', event => {
      const newValue = (event.target as HTMLInputElement)?.value as Value;

      this._value = newValue;
      this.onValueChanged?.(newValue);
      onValueChanged?.(newValue);
    });
  }

  public abstract get value(): Value;

  public abstract set value(newValue: Value);
}

export class NumberInputController extends InputController<number> {
  public get value(): number {
    return this.inputElement.valueAsNumber;
  }

  public set value(newValue) {
    this._value = newValue;
    this.inputElement.valueAsNumber = newValue;
  }
}
