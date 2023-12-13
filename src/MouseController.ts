export class MouseController {
  constructor(target: HTMLElement, private onMouseClick: (x: number, y: number, clickType: 'left' | 'right') => void) {
    target.addEventListener('mouseup', this.handleMouseClick.bind(this));
    target.addEventListener('contextmenu', this.preventContextMenu.bind(this));
    target.addEventListener('mousemove', this.handleMouseMove.bind(this));
    target.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
  }

  private _mousePosition?: {
    x: number;
    y: number;
  }

  public get mousePosition() {
    return this._mousePosition;
  }

  private handleMouseClick(event: MouseEvent) {
    this.onMouseClick(event.x, event.y, event.button === 2 ? 'right' : 'left');
  }

  private preventContextMenu(event: MouseEvent) {
    event.preventDefault();
  }

  private handleMouseMove(event: MouseEvent) {
    this._mousePosition = {
      x: event.x,
      y: event.y
    }
  }

  private handleMouseLeave() {
    this._mousePosition = undefined;
  }
}
