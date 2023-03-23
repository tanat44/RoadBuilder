import { ToolHandlerSelect } from "./Tools/ToolHandlerSelect";
import { ToolHandlerStation } from "./Tools/ToolHandlerStation";
import { Tools } from "./Tools/ToolState";
import { Manager } from "./Manager";
import * as THREE from "three";
import { Intersection, Object3D, Vector2 } from "three";
import { ToolHandlerBase } from "./Tools/ToolHandlerBase";
import { ToolHandlerIntersection } from "./Tools/ToolHandlerIntersection";
import { ToolHandlerDelete } from "./Tools/ToolHandlerDelete";
import { ToolHandlerRoad } from "./Tools/ToolHandlerRoad";

export class MouseHandler {
  manager: Manager;
  toolHandlers: Map<Tools, ToolHandlerBase>;

  constructor(manager: Manager) {
    this.manager = manager;
    this.toolHandlers = new Map<Tools, ToolHandlerBase>();

    this.registerEventListener();
    this.registerToolHandler();
    this.manager.toolState.subscribeToolChange(
      (oldTool: Tools, newTool: Tools) =>
        this.handleToolChange(oldTool, newTool)
    );
  }

  registerEventListener() {
    document.addEventListener("pointerdown", (e) => this.onPointerDown(e));
    document.addEventListener("pointerup", (e) => this.onPointerUp(e));
    document.addEventListener("pointermove", (e) => this.onPointerMove(e));
  }

  handleToolChange(oldTool: Tools, newTool: Tools) {
    if (this.toolHandlers.has(oldTool)) this.toolHandlers.get(oldTool).onExit();

    if (this.toolHandlers.has(newTool))
      this.toolHandlers.get(newTool).onStart();
  }

  registerToolHandler() {
    this.toolHandlers.set(Tools.Select, new ToolHandlerSelect(this.manager));
    this.toolHandlers.set(Tools.Delete, new ToolHandlerDelete(this.manager));
    this.toolHandlers.set(Tools.Station, new ToolHandlerStation(this.manager));
    this.toolHandlers.set(
      Tools.Intersection,
      new ToolHandlerIntersection(this.manager)
    );
    this.toolHandlers.set(Tools.Road, new ToolHandlerRoad(this.manager));
  }

  getIntersectionPoint(event: PointerEvent): Intersection {
    const pointer = new Vector2();
    pointer.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    this.manager.raycaster.setFromCamera(pointer, this.manager.camera);

    const intersects = this.manager.raycaster.intersectObjects(
      this.manager.objects,
      false
    );
    if (intersects.length > 0) return intersects[0];

    return null;
  }

  onPointerDown(event: PointerEvent) {
    const intersect = this.getIntersectionPoint(event);
    if (!intersect) return;

    // set object name in ui
    if (intersect.object) {
      this.manager.ui.setObjectNameText(intersect.object.name);
    }

    const handler = this.getCurrentToolHandler();
    if (!handler) return;

    handler.onPointerDown(event, intersect);
    this.manager.render();
  }

  onPointerMove(event: PointerEvent) {
    const intersect = this.getIntersectionPoint(event);
    if (!intersect) return;

    const handler = this.getCurrentToolHandler();
    if (!handler) return;

    handler.onPointerMove(event, intersect);
    this.manager.render();
  }

  onPointerUp(event: PointerEvent) {
    const intersect = this.getIntersectionPoint(event);
    if (!intersect) return;

    const handler = this.getCurrentToolHandler();
    if (!handler) return;

    handler.onPointerUp(event, intersect);
    this.manager.render();
  }

  getCurrentToolHandler(): ToolHandlerBase | null {
    const currentTool = this.manager.toolState.getCurrentTool();
    if (this.toolHandlers.has(currentTool))
      return this.toolHandlers.get(currentTool);

    console.log(
      `No handler for tool ${this.manager.toolState.getCurrentToolString()}`
    );
    return null;
  }
}
