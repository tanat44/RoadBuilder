import {
  CLOSE_CONTROL_POINT_DISTANCE,
  FAR_CONTROL_POINT_DISTANCE,
  LANE_DISTANCE,
} from "./../Const";
import { Euler, MathUtils, Object3D, Quaternion, Vector3 } from "three";
import { Node, NodeType } from "./Node";
import * as THREE from "three";
import { Manager } from "../Manager";
import { EndPointControlPoints, PairControlPoints } from "./types";

export enum EdgeType {
  Highway, // Intersection <> Intersection
  LocalRoad, // Intersection <> Station
}
export class Edge {
  gameObject: Object3D;
  numberOfLanes: number;
  from: Node;
  to: Node;
  static lastId: number = 0;

  constructor(from: Node, to: Node) {
    this.numberOfLanes = 3;
    this.from = from;
    this.to = to;
    this.gameObject = this.createGameObject();
    this.gameObject.name = `Edge-${Edge.lastId}`;
    Edge.lastId++;
  }

  createGameObject(): Object3D {
    const geometry = new THREE.PlaneGeometry(1, 1); // long stick on x-axis
    const plane = new THREE.Mesh(
      geometry,
      Manager.instance.assets.edgeMaterial
    );
    this.updateEdgeTransform(plane);
    Manager.instance.addGameObjectToScene(plane);
    return plane;
  }

  getRoadType() {
    if (
      this.to.type === NodeType.Station ||
      this.from.type === NodeType.Station
    )
      return EdgeType.LocalRoad;
    return EdgeType.Highway;
  }

  getNodeByType(type: NodeType): Node {
    if (this.from.type === type) return this.from;
    if (this.to.type === type) return this.to;
    return null;
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

  getDirection(fromNode: Node): Vector3 {
    let dir = this.to.getPosition().sub(this.from.getPosition()).normalize();
    if (fromNode === this.to) dir.multiplyScalar(-1);
    return dir;
  }

  getStationControlPoints(
    nearDistance: number,
    farDistance: number
  ): EndPointControlPoints[] {
    const stationNode = this.getNodeByType(NodeType.Station);
    if (!stationNode) return [];
    const ep: EndPointControlPoints = Edge.getControlPoint(
      stationNode.getPosition(),
      this.getDirection(stationNode),
      nearDistance,
      farDistance
    );
    return [ep];
  }

  getControlPoints(
    position: Vector3,
    direction: Vector3,
    nearDistance: number,
    farDistance: number
  ): EndPointControlPoints[] {
    const v = direction;
    const v_n = v.clone().applyAxisAngle(new Vector3(0, 1, 0), Math.PI / 2);
    const pos = position;
    let endPoints: EndPointControlPoints[] = [];

    // odd number of lanes
    const half = Math.floor(this.numberOfLanes / 2);
    if (this.numberOfLanes % 2 === 1) {
      for (let i = -half; i <= half; ++i) {
        endPoints.push(
          Edge.getControlPoint(
            pos.clone().add(v_n.clone().multiplyScalar(i * LANE_DISTANCE)),
            v,
            nearDistance,
            farDistance
          )
        );
      }
    } else {
      // even number of lanes
      for (let i = -half; i <= half; ++i) {
        if (i === 0) continue;
        const x = i < 0 ? -0.5 : 0.5;
        endPoints.push(
          Edge.getControlPoint(
            pos
              .clone()
              .add(v_n.clone().multiplyScalar((i + x) * LANE_DISTANCE)),
            v,
            nearDistance,
            farDistance
          )
        );
      }
    }

    return endPoints;
  }

  static getControlPoint(
    endPoint: Vector3,
    direction: Vector3,
    nearDistance: number,
    farDistance: number
  ): EndPointControlPoints {
    let output: EndPointControlPoints = {
      nearPoint: endPoint
        .clone()
        .add(direction.clone().multiplyScalar(nearDistance)),
      farPoint: endPoint
        .clone()
        .add(direction.clone().multiplyScalar(farDistance)),
    };
    return output;
  }

  static pairEndPointControlPoints(
    cps1: EndPointControlPoints[],
    cps2: EndPointControlPoints[]
  ): PairControlPoints[] {
    let pairs: PairControlPoints[] = [];
    for (let i = 0; i < cps1.length; ++i) {
      for (let j = 0; j < cps2.length; ++j) {
        pairs.push({
          cp1: cps1[i],
          cp2: cps2[j],
        });
      }
    }
    return pairs;
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
