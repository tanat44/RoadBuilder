import { Object3D, Vector3 } from "three";

export class VehicleState {
  position: Vector3;
  velocity: Vector3;
  acceleration: Vector3;
  forward: Vector3;

  constructor() {
    this.position = new Vector3(0, 0, 0);
    this.velocity = new Vector3(10, 0, 0);
    this.acceleration = new Vector3(0, 0, 0);
    this.forward = new Vector3(1, 0, 0);
  }
}
