import { Object3D, Vector3 } from "three";
import { Edge } from "./Edge";

export enum NodeType {
  Station,
  Intersection,
}

export class Node {
  gameObject: Object3D;
  type: NodeType;
  edges: Edge[];

  constructor(type: NodeType, gameObject: Object3D) {
    this.type = type;
    this.gameObject = gameObject;
  }

  getSaveData() :NodeSaveData{
    return {
      name: this.gameObject.name,
      type: this.type,
      position: this.gameObject.position
    }
  }
}

export class NodeSaveData {
  name: string
  type: NodeType
  position: Vector3
}
