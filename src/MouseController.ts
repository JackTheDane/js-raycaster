export class MouseController {
  constructor(target: HTMLElement, private onMouseClick: (x: number, y: number, clickType: 'left' | 'right') => void) {
    target.addEventListener('mouseup', this.handleMouseClick.bind(this))
    target.addEventListener('contextmenu', this.preventContextMenu.bind(this))
  }

  private handleMouseClick(event: MouseEvent) {
    this.onMouseClick(event.x, event.y, event.button === 2 ? 'right' : 'left');
  }

  private preventContextMenu(event: MouseEvent) {
    event.preventDefault();
  }
}
