import { Map } from './../Map/Map';
import { Intersection } from "three";
import { Manager } from "../Manager";
import { ToolHandlerBase } from "./ToolHandlerBase";
import { Tools } from "./ToolState";

export class ToolHandlerDelete extends ToolHandlerBase {
  constructor(manager: Manager) {
    super(manager);
    this.tool = Tools.Station;
  }

  onPointerDown(event: PointerEvent, intersect: Intersection) {
    if (event.button !== 0 || !intersect || !intersect.object) return;
    if (intersect.object !== this.manager.assets.plane) {
      const node = this.manager.map.findNodeGameObject(intersect.object)
      if (!node) return
      this.manager.map.removeNode(node);
    }
  }
}
