import { Manager } from "./../Manager";
import { Object3D, Vector3 } from "three";
import * as THREE from "three";

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
}
