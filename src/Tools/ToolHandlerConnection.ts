import { Intersection } from "three";
import { Manager } from "../Manager";
import { Node } from "../Map/Node";
import { ToolHandlerBase } from "./ToolHandlerBase";
import { Tools } from "./ToolState";

export class ToolHandlerConnection extends ToolHandlerBase {
  selectedNodes: Node[];

  constructor(manager: Manager) {
    super(manager);
    this.tool = Tools.Station;
    this.selectedNodes = [];
  }

  onPointerDown(event: PointerEvent, intersect: Intersection) {
    if (event.button !== 0 || !intersect) return;

    if (intersect.object === this.manager.assets.plane) return;

    const node = this.manager.map.findNodeGameObject(intersect.object);
    if (!node) return;
    if (this.selectedNodes.indexOf(node) > -1) {
      this.manager.ui.setInfoText("Choose different node to connect");
      return;
    }
    this.selectedNodes.push(node);

    if (this.selectedNodes.length === 1) {
      this.manager.ui.setInfoText("Select 1 more node");
    } else if (this.selectedNodes.length === 2) {
      const edge = this.manager.map.createEdge(
        this.selectedNodes[0],
        this.selectedNodes[1]
      );
      if (!edge) this.manager.ui.setInfoText("Connection exists");
      this.selectedNodes = [];
    }
  }

  onStart(): void {
    this.manager.ui.setInfoText("Choose 2 nodes");
  }
  onExit(): void {
    this.selectedNodes = [];
  }
}
