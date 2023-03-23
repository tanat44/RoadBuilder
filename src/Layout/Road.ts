import { CONTROL_POINT_DISTANCE, LANE_DISTANCE } from "../Const";
import { Euler, MathUtils, Object3D, Quaternion, Vector3 } from "three";
import { Node, NodeType } from "./Node";
import * as THREE from "three";
import { Manager } from "../Manager";
import { PairSwitchPoint, SwitchPoint } from "../NavigationMap/SwitchPoint";

export enum RoadType {
  Highway, // Intersection <> Intersection
  LocalRoad, // Intersection <> Station
}
export class Road {
  gameObject: Object3D;
  numberOfLanes: number;
  from: Node;
  to: Node;
  fromSwitchPoints: SwitchPoint[];
  toSwitchPoints: SwitchPoint[];
  direction: Vector3;
  static lastId: number = 0;

  constructor(from: Node, to: Node) {
    this.numberOfLanes = 3;
    this.from = from;
    this.to = to;
    this.createGameObject();
    this.recalculate();
    this.gameObject.name = `Edge-${Road.lastId}`;
    Road.lastId++;
  }

  createGameObject() {
    const geometry = new THREE.PlaneGeometry(1, 1); // long stick on x-axis
    this.gameObject = new THREE.Mesh(
      geometry,
      Manager.instance.assets.edgeMaterial
    );
    this.recalculate();
    Manager.instance.addGameObjectToScene(this.gameObject);
  }

  calculateSwitchPoint() {
    this.fromSwitchPoints = this.calculateSwitchPointAt(this.from);
    this.toSwitchPoints = this.calculateSwitchPointAt(this.to);
  }

  calculateSwitchPointAt(node: Node): SwitchPoint[] {
    if (node.type === NodeType.Station)
      return [new SwitchPoint(node.getPosition(), this, node)];

    const distance = CONTROL_POINT_DISTANCE;
    const v =
      node === this.from
        ? this.direction.clone()
        : this.direction.clone().multiplyScalar(-1);
    const v_n = v.clone().applyAxisAngle(new Vector3(0, 1, 0), Math.PI / 2);
    const pos = node.getPosition().add(v.multiplyScalar(distance));
    let switchPoints: SwitchPoint[] = [];

    // odd number of lanes
    const half = Math.floor(this.numberOfLanes / 2);
    if (this.numberOfLanes % 2 === 1) {
      for (let i = -half; i <= half; ++i) {
        switchPoints.push(
          new SwitchPoint(
            pos.clone().add(v_n.clone().multiplyScalar(i * LANE_DISTANCE)),
            this,
            node
          )
        );
      }
    } else {
      // even number of lanes
      for (let i = -half; i <= half; ++i) {
        if (i === 0) continue;
        const x = i < 0 ? -0.5 : 0.5;
        switchPoints.push(
          new SwitchPoint(
            pos
              .clone()
              .add(v_n.clone().multiplyScalar((i + x) * LANE_DISTANCE)),
            this,
            node
          )
        );
      }
    }
    return switchPoints;
  }

  getSwitchPointAt(node: Node): SwitchPoint[] {
    if (node === this.from) return this.fromSwitchPoints;
    else if (node === this.to) return this.toSwitchPoints;

    return [];
  }

  getRoadType() {
    if (
      this.to.type === NodeType.Station ||
      this.from.type === NodeType.Station
    )
      return RoadType.LocalRoad;
    return RoadType.Highway;
  }

  getNodeByType(type: NodeType): Node {
    if (this.from.type === type) return this.from;
    if (this.to.type === type) return this.to;
    return null;
  }

  recalculate() {
    this.direction = this.to
      .getPosition()
      .sub(this.from.getPosition())
      .normalize();
    this.calculateSwitchPoint();
    this.updateGameObject();
  }

  updateGameObject() {
    const p1 = this.from.gameObject.position.clone();
    const p2 = this.to.gameObject.position.clone();
    const width = 10;
    const distance = p1.distanceTo(p2);
    this.gameObject.scale.set(distance, width, 1);
    const direction = p2.clone().sub(p1).normalize();
    this.gameObject.position.set(0, 0, 0);
    this.gameObject.lookAt(direction);
    this.gameObject.position
      .copy(p1)
      .add(direction.multiplyScalar(distance / 2.0));
    const q = this.gameObject.quaternion;
    q.multiply(
      new Quaternion().setFromEuler(new Euler(0, MathUtils.degToRad(90), 0))
    ).multiply(
      new Quaternion().setFromEuler(new Euler(MathUtils.degToRad(90), 0, 0))
    );
    this.gameObject.setRotationFromQuaternion(q);
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
