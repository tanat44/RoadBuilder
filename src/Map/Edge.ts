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
    this.gameObject = this.createEdge();
    this.gameObject.name = `Edge-${Edge.lastId}`;
    Edge.lastId++;
  }

  createEdge(): Object3D {
    const geometry = new THREE.PlaneGeometry(1, 1); // long stick on x-axis
    const plane = new THREE.Mesh(
      geometry,
      Manager.instance.assets.connectionMaterial
    );
    this.updateEdgeTransform(plane);
    Manager.instance.addGameObjectToScene(plane);
    return plane;
  }

  updateEdgeTransform(plane: Object3D) {
    const p1 = this.from.gameObject.position.clone();
    const p2 = this.to.gameObject.position.clone();
    const width = 10;
    const distance = p1.distanceTo(p2);
    plane.scale.set(distance, width, 1);
    const direction = p2.clone().sub(p1).normalize();
    plane.position.set(0, 0, 0);
    plane.lookAt(direction);
    plane.position.copy(p1).add(direction.multiplyScalar(distance / 2.0));
    const q = plane.quaternion;
    q.multiply(
      new Quaternion().setFromEuler(new Euler(0, MathUtils.degToRad(90), 0))
    ).multiply(
      new Quaternion().setFromEuler(new Euler(MathUtils.degToRad(90), 0, 0))
    );
    plane.setRotationFromQuaternion(q);
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
