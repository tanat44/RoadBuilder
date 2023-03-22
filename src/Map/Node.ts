import { Material, Object3D, Vector3 } from "three";
import { Manager } from "../Manager";
import { Edge } from "./Edge";
import * as THREE from "three";

export enum NodeType {
  Station,
  Intersection,
}

export class Node {
  type: NodeType;
  edges: Edge[];
  gameObject: Object3D;
  static lastId: number = 0;

  constructor(type: NodeType, position: Vector3) {
    this.type = type;
    this.edges = [];
    let material =
      type === NodeType.Intersection
        ? Manager.instance.assets.intersectionMaterial
        : Manager.instance.assets.stationMaterial;
    this.gameObject = this.createCube(position, material);
    this.gameObject.name = `Node-${Node.lastId}`;
    Node.lastId++;
  }

  getSaveData(): NodeSaveData {
    return {
      name: this.gameObject.name,
      type: this.type,
      position: this.gameObject.position,
    };
  }

  createCube(pos: Vector3, material: Material): Object3D {
    const gameObject = new THREE.Mesh(
      Manager.instance.assets.cubeGeo,
      material
    );
    gameObject.position.copy(pos);
    gameObject.position
      .divideScalar(50)
      .floor()
      .multiplyScalar(50)
      .addScalar(25);
    Manager.instance.addGameObjectToScene(gameObject);
    return gameObject;
  }

  removeEdge(edge: Edge) {
    const index = this.edges.indexOf(edge);
    if (index === -1) return;
    this.edges.splice(index, 1);
  }

  getName(): string {
    return this.gameObject.name;
  }
}

export class NodeSaveData {
  name: string;
  type: NodeType;
  position: Vector3;
}
