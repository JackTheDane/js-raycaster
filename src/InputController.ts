export abstract class InputController<Value> {
  constructor(selector: string) {
    this.inputElement = document.querySelector<HTMLInputElement>(selector)!;
  }

  protected inputElement: HTMLInputElement;

  public abstract get value(): Value;
}
