import { Event, Intersection, Object3D, Vector2 } from "three";
import { Manager } from "../Manager";
import { ToolHandlerBase } from "./ToolHandlerBase";
import { Tools } from "./ToolState";

export class ToolHandlerSelect extends ToolHandlerBase {
  selectedObject: Object3D;

  constructor(manager: Manager) {
    super(manager);
    this.selectedObject = null;
    this.tool = Tools.Station;
  }

  onPointerDown(event: PointerEvent, intersect: Intersection) {
    if (
      event.button !== 0 ||
      !intersect ||
      !intersect.object ||
      this.manager.transformControl.dragging
    )
      return;

    if (intersect.object === this.manager.assets.plane) {
      this.manager.transformControl.detach();
      this.manager.ui.setInfoText("Deselected the node")
      return;
    }

    // only allow transform control on node (not edge)
    if (intersect.object !== this.manager.transformControl.object && this.manager.map.findNodeGameObject(intersect.object)) {
      this.selectedObject = intersect.object;
      this.manager.transformControl.attach(intersect.object);
      this.manager.ui.setInfoText("Use handle to move node")
    }
  }

  onPointerMove(event: PointerEvent, intersect: Intersection): void {}

  onPointerUp(event: PointerEvent, intersect: Intersection): void {}

  onStart(): void {
      this.manager.ui.setInfoText("Pick a node to move")
  }
  onExit(): void {
    this.manager.transformControl.detach();
  }
}
