import { Manager } from "./../Manager";
import { Object3D, Vector3 } from "three";
import * as THREE from "three";
import { EndPointControlPoints } from "./types";
import { Edge } from "./Edge";

export class Segment {
  controlPoints: Vector3[];
  gameObject: Object3D;
  length: number;

  static DISTANCE_PER_POINT: number = 1; // lower gives more detail

  constructor(controlPoints: Vector3[]) {
    this.controlPoints = controlPoints;
    this.length = 0;
    this.gameObject = this.createGameObject();
  }

  createGameObject(): Object3D {
    const curve = new THREE.CubicBezierCurve3(
      this.controlPoints[0],
      this.controlPoints[1],
      this.controlPoints[2],
      this.controlPoints[3]
    );
    let estimatedDistance = Segment.getTotalDistance(this.controlPoints);
    const points = curve.getPoints(
      estimatedDistance / Segment.DISTANCE_PER_POINT
    );
    this.length = Segment.getTotalDistance(points);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const gameObject = new THREE.Line(
      geometry,
      Manager.instance.assets.curveMaterial
    );
    Manager.instance.addGameObjectToScene(gameObject);
    return gameObject;
  }

  static getTotalDistance(points: Vector3[]): number {
    let distance = 0;
    for (let i = 0; i < points.length - 1; ++i) {
      distance += points[i].distanceTo(points[i + 1]);
    }
    return distance;
  }

  static createSegmentEndPointControlPoints(
    eps1: EndPointControlPoints[],
    eps2: EndPointControlPoints[],
    reversePair: boolean = false
  ): Segment[] {
    const segments: Segment[] = [];
    const cpPairs = Edge.pairEndPointControlPoints(eps1, eps2);
    cpPairs.forEach((cpPair) => {
      const cp1 = cpPair.cp1;
      const cp2 = cpPair.cp2;
      if (!reversePair)
        segments.push(
          new Segment([
            cp1.farPoint,
            cp1.nearPoint,
            cp2.nearPoint,
            cp2.farPoint,
          ])
        );
      else
        segments.push(
          new Segment([
            cp1.nearPoint,
            cp1.farPoint,
            cp2.farPoint,
            cp2.nearPoint,
          ])
        );
    });
    return segments;
  }
}
