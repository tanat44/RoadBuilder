export enum Tools {
  None,
  Delete,
  Intersection,
  Station,
  Move,
  Connect,
}

export class ToolState {
  function: Tools;
  selectedObject: THREE.Mesh | null;
  onToolChange: ()=> void;

  constructor() {
    this.function = Tools.None;
    this.selectedObject = null;
  }

  changeTool(newTool: Tools): void {
    this.selectedObject = null;
    this.function = newTool;
    this.onToolChange();
  }

  getCurrentToolString(): string {
    return Tools[this.function];
  }

  getCurrentTool(): Tools {
    return this.function;
  }
}
