import { Line3, Matrix4, Object3D, Vector3 } from "three";

export class VehicleState {
  position: Vector3;
  velocity: Vector3;
  acceleration: Vector3;
  forward: Vector3;
  right: Vector3;
  up: Vector3;
  corneringRadius: number;

  constructor(initialPosition: Vector3) {
    this.position = new Vector3().copy(initialPosition);
    this.velocity = new Vector3(0, 0, 0);
    this.acceleration = new Vector3(0, 0, 0);
    this.forward = new Vector3(1, 0, 0);
    this.right = new Vector3(0, 0, 1);
    this.up = new Vector3(0, 1, 0);
    this.corneringRadius = Infinity;
  }

  updateDirection(worldDirection: Matrix4) {
    worldDirection.extractBasis(this.forward, this.up, this.right);
    // console.log(this.forward, this.right);
  }

  copyState(state: VehicleState) {
    this.position.copy(state.position);
    this.velocity.copy(state.velocity);
    this.acceleration.copy(state.acceleration);
    this.forward.copy(state.forward);
    this.right.copy(state.right);
    this.up.copy(state.up);
  }

  getPerpendicularLine(): Line3 {
    return new Line3(this.position, this.position.clone().add(this.right));
  }

  printState() {
    // velocity
    const v = this.velocity.length();
    let text = `v ${VehicleState.velocityToKmh(v).toFixed(2)}, `;

    // acceleration
    const ax = this.forward.clone().dot(this.acceleration);
    const ac = this.right.clone().dot(this.acceleration);
    text += `ax ${VehicleState.accelerationToKmh2(ax).toFixed(
      2
    )}, ac ${VehicleState.accelerationToKmh2(ac).toFixed(2)}`;

    console.log(text);
  }

  static velocityToKmh(velocityMs: number) {
    return (velocityMs * 18) / 5;
  }

  static accelerationToKmh2(accelMs2: number) {
    return (accelMs2 * 18) / 5 / 5;
  }
}
