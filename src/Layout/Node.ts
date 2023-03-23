import { Material, Object3D, Vector3 } from "three";
import { Manager } from "../Manager";
import { Road } from "./Road";
import * as THREE from "three";

export enum NodeType {
  Station,
  Intersection,
}

export type RoadPair = {
  road1: Road;
  road2: Road;
};

export class Node {
  type: NodeType;
  roads: Road[];
  gameObject: Object3D;
  static lastId: number = 0;

  constructor(type: NodeType, position: Vector3) {
    this.type = type;
    this.roads = [];
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

  removeEdge(edge: Road) {
    const index = this.roads.indexOf(edge);
    if (index === -1) return;
    this.roads.splice(index, 1);
  }

  getName(): string {
    return this.gameObject.name;
  }

  getRoadPairs(): RoadPair[] {
    let output: RoadPair[] = [];
    for (let i = 0; i < this.roads.length; ++i) {
      for (let j = i + 1; j < this.roads.length; ++j) {
        output.push({
          road1: this.roads[i],
          road2: this.roads[j],
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
