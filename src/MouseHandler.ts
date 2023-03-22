import { ToolHandlerStation } from './Tools/ToolHandlerStation';
import { Tools } from './Tools/ToolState';
import { Manager } from './Manager';
import * as THREE from "three";
import { Intersection, Mesh, Object3D, Vector2 } from 'three';
import { ToolHandlerBase } from './Tools/ToolHandlerBase';
import { ToolHandlerIntersection } from './Tools/ToolHandlerIntersection';
import { ToolHandlerDelete } from './Tools/ToolHandlerDelete';


export class MouseHandler {

  manager: Manager;
  pointer: Vector2;
  onUpPosition: Vector2;
  onDownPosition: Vector2;
  selectedCube : Object3D[];
  toolHandlers: Map<Tools, ToolHandlerBase>;

  constructor(manager: Manager){
    this.manager = manager;
    this.pointer = new THREE.Vector2();
    this.onUpPosition = new THREE.Vector2();
    this.onDownPosition = new THREE.Vector2();
    this.selectedCube = []
    this.toolHandlers = new Map<Tools, ToolHandlerBase>();
    this.toolHandlers.set(Tools.Delete, new ToolHandlerDelete(manager));
    this.toolHandlers.set(Tools.Station, new ToolHandlerStation(manager));
    this.toolHandlers.set(Tools.Intersection, new ToolHandlerIntersection(manager));
    this.registerEventListener()
  }

  registerEventListener(){
    document.addEventListener("pointerdown", (e) => this.onPointerDown(e));
    document.addEventListener("pointerup", (e) => this.onPointerUp(e));
    // document.addEventListener("pointermove", onPointerMove);
  }

  onPointerDown(event: PointerEvent) {
      const intersect = this.getIntersectionPoint(event)
      if (!intersect) return;

      const currentTool = this.manager.toolState.getCurrentTool();
      if (this.toolHandlers.has(currentTool))
        this.toolHandlers.get(currentTool).onPointerDown(event, intersect);
      else 
        console.log(`No handler for tool ${this.manager.toolState.getCurrentToolString()}`)

      // if (intersect.object !== this.manager.assets.plane) {
      //   if (this.selectedCube.length === 0) {
      //     (intersect.object as any).material = this.manager.assets.cubeMaterialSelected;
      //   } else {
      //     (this.selectedCube[0] as any).material = this.manager.assets.cubeMaterial;
      //   }
      //   this.selectedCube.push(intersect.object);
      // } else {

      // }
  
      // if (this.selectedCube.length === 2) {
      //   const points = [];
      //   points.push(this.selectedCube[0].position);
      //   points.push(this.selectedCube[1].position);
  
      //   const geometry = new THREE.BufferGeometry().setFromPoints(points);
      //   const line = new THREE.Line(geometry, this.manager.assets.lineMaterial);
      //   this.manager.scene.add(line);
      //   this.selectedCube = [];
      // }
  
      this.manager.render();
  }

  getIntersectionPoint(event: PointerEvent) :Intersection {
    this.onDownPosition.x = event.clientX;
    this.onDownPosition.y = event.clientY;
  
    this.pointer.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
  
    this.manager.raycaster.setFromCamera(this.pointer, this.manager.camera);
  
    const intersects = this.manager.raycaster.intersectObjects(this.manager.objects, false);
  
    if (intersects.length > 0) 
      return intersects[0];

    return null;
  }
  
  onPointerUp(event: PointerEvent) {
    this.onUpPosition.x = event.clientX;
    this.onUpPosition.y = event.clientY;
  
    if (this.onDownPosition.distanceTo(this.onUpPosition) === 0) this.manager.transformControl.detach();
  }
  
  // onPointerMove(event: any) {
  //   pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  //   pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  //   raycaster.setFromCamera(pointer, camera);
  
  //   const intersects = raycaster.intersectObjects(splineHelperObjects, false);
  
  //   if (intersects.length > 0) {
  //     const object = intersects[0].object;
  
  //     if (object !== transformControl.object) {
  //       transformControl.attach(object);
  //     }
  //   }
  // }
  
}