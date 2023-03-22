export enum Tools {
  Select,
  Delete,
  Intersection,
  Station,
  Move,
  Connection,
}

export type onToolChange =
  | ((oldTool: Tools, newTool: Tools) => void)
  | (() => void);

export class ToolState {
  tool: Tools;
  selectedObject: THREE.Mesh | null;
  onToolChange: onToolChange[];

  constructor() {
    this.tool = Tools.Select;
    this.selectedObject = null;
    this.onToolChange = [];
  }

  changeTool(newTool: Tools): void {
    const oldTool = this.tool;
    this.selectedObject = null;
    this.tool = newTool;
    this.onToolChange.forEach((f) => f(oldTool, newTool));
  }

  subscribeToolChange(f: onToolChange) {
    this.onToolChange.push(f);
  }

  getCurrentToolString(): string {
    return Tools[this.tool];
  }

  getCurrentTool(): Tools {
    return this.tool;
  }
}
