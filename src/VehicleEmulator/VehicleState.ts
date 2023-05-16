import { Matrix4, Object3D, Vector3 } from "three";

export class VehicleState {
  position: Vector3;
  velocity: Vector3;
  acceleration: Vector3;
  forward: Vector3;
  right: Vector3;
  up: Vector3;

  constructor() {
    this.position = new Vector3(0, 0, 0);
    this.velocity = new Vector3(10, 0, 0);
    this.acceleration = new Vector3(0, 0, 0);
    this.forward = new Vector3(1, 0, 0);
    this.right = new Vector3(0, 0, 1);
    this.up = new Vector3(0, 1, 0);
  }

  updateDirection(worldDirection: Matrix4) {
    worldDirection.extractBasis(this.forward, this.up, this.right);
    console.log(this.forward, this.right);
  }

  copyState(state: VehicleState) {
    this.position.copy(state.position);
    this.velocity.copy(state.velocity);
    this.acceleration.copy(state.acceleration);
    this.forward.copy(state.forward);
    this.right.copy(state.right);
    this.up.copy(state.up);
  }
}
