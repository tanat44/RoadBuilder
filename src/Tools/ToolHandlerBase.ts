import { Intersection, Material, Object3D, Vector3 } from "three";
import { Manager } from "../Manager";
import { Tools } from "./ToolState";
import * as THREE from "three";

export class ToolHandlerBase {
  tool: Tools;
  manager: Manager;

  constructor(manager: Manager) {
    this.tool = Tools.Select;
    this.manager = manager;
  }

  onPointerDown(event: PointerEvent, intersect: Intersection) {
    console.log("Unimplemented onPointDown");
  }

  onPointerUp(event: PointerEvent) {
    console.log("Unimplemented onPointUp");
  }

  onStart() {}
  onExit() {}
}
