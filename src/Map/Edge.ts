import { Euler, MathUtils, Object3D, Quaternion, Vector3 } from "three";
import { Node } from "./Node";
import * as THREE from "three";
import { Manager } from "../Manager";
export class Edge {
  gameObject: Object3D;
  numberOfLanes: number;
  from: Node;
  to: Node;
  static lastId: number = 0;

  constructor(from: Node, to: Node) {
    this.numberOfLanes = 2;
    this.from = from;
    this.to = to;
    this.gameObject = this.createEdge(
      from.gameObject.position,
      to.gameObject.position
    );
    this.gameObject.name = `Edge-${Edge.lastId}`;
    Edge.lastId++;
  }

  createEdge(p1: Vector3, p2: Vector3): Object3D {
    const width = 10;
    const distance = p1.distanceTo(p2);
    const geometry = new THREE.PlaneGeometry(distance, width);
    const plane = new THREE.Mesh(
      geometry,
      Manager.instance.assets.connectionMaterial
    );
    const direction = p2.clone().sub(p1).normalize();
    plane.lookAt(direction);
    plane.position.copy(p1).add(direction.multiplyScalar(distance / 2.0));

    const q = plane.quaternion;
    q.multiply(
      new Quaternion().setFromEuler(new Euler(0, MathUtils.degToRad(90), 0))
    ).multiply(
      new Quaternion().setFromEuler(new Euler(MathUtils.degToRad(90), 0, 0))
    );
    plane.setRotationFromQuaternion(q);
    Manager.instance.addGameObjectToScene(plane);
    return plane;
  }

  getSaveData(): EdgeSaveData {
    return {
      name: this.gameObject.name,
      from: this.from.gameObject.name,
      to: this.to.gameObject.name,
    };
  }
}

export class EdgeSaveData {
  name: string;
  from: string;
  to: string;
}
