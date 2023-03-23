import { Material, Object3D, Vector3 } from "three";
import { Manager } from "../Manager";
import { Edge } from "./Edge";
import * as THREE from "three";

export enum NodeType {
  Station,
  Intersection,
}

export type EdgePair = {
  edge1: Edge;
  edge2: Edge;
};

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
    this.gameObject = this.createGameObject(position, material);
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

  createGameObject(pos: Vector3, material: Material): Object3D {
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

  getPosition(): Vector3 {
    return this.gameObject.position.clone();
  }

  removeEdge(edge: Edge) {
    const index = this.edges.indexOf(edge);
    if (index === -1) return;
    this.edges.splice(index, 1);
  }

  getName(): string {
    return this.gameObject.name;
  }

  getEdgePairs(): EdgePair[] {
    let output: EdgePair[] = [];
    for (let i = 0; i < this.edges.length; ++i) {
      for (let j = i + 1; j < this.edges.length; ++j) {
        output.push({
          edge1: this.edges[i],
          edge2: this.edges[j],
        });
      }
    }
    return output;
  }
}

export class NodeSaveData {
  name: string;
  type: NodeType;
  position: Vector3;
}
