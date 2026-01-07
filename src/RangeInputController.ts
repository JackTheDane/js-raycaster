import { NumberInputController } from "./InputController";

export class RangeInputController extends NumberInputController {
  private _numberInputController: NumberInputController;

  constructor(protected inputElement: HTMLInputElement) {
    super(inputElement, (newValue) => {
      this._numberInputController.value = newValue;
    });

    const numberInputElement = this.mountNumberInput();
    this._numberInputController = new NumberInputController(numberInputElement, (newValue) => {
      this.value = newValue;
    });
  }

  private mountNumberInput() {
    const numberInput = document.createElement('input');

    numberInput.type = 'number';
    numberInput.value = this.inputElement.value;
    numberInput.min = this.inputElement.min;
    numberInput.max = this.inputElement.max;
    numberInput.step = this.inputElement.step;

    this.inputElement.after(numberInput);

    return numberInput;
  }
}
