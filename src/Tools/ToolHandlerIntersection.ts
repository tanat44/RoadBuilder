import { NodeType } from "../Layout/Node";
import { Intersection } from "three";
import { Manager } from "../Manager";
import { ToolHandlerBase } from "./ToolHandlerBase";
import { Tools } from "./ToolState";

export class ToolHandlerIntersection extends ToolHandlerBase {
  constructor(manager: Manager) {
    super(manager);
    this.tool = Tools.Station;
  }

  onPointerDown(event: PointerEvent, intersect: Intersection) {
    if (event.button !== 0 || !intersect) return;

    const pos = intersect.point.add(intersect.face.normal);
    this.manager.map.createNode(NodeType.Intersection, pos);
  }
}
