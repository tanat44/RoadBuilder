import { Vector3 } from "three";
import { CONTACT_FORCE_COEFFICIENT } from "../Const";
import { InputType, Input } from "../Input";
import { MathUtility } from "../Math/MathUtility";
import { Axle } from "./Axle";
import { TireModel } from "./TireModel";

export class SteeringAxle extends Axle {
  steeringAngle: number; // degree
  maxSteeringAngle: number; // degree
  tireModel: TireModel;

  constructor(axleCenter: Vector3, width: number) {
    super(axleCenter, width, true, false);
    this.steeringAngle = 0;
    this.maxSteeringAngle = 40;
    this.tireModel = new TireModel();
  }

  // value -1 to 1
  steer(value: number) {
    this.steeringAngle = this.maxSteeringAngle * value;
    this.leftWheel.steer(this.steeringAngle);
    this.rightWheel.steer(this.steeringAngle);
  }

  tick(dt: number, inputs: Map<InputType, Input>) {
    super.tick(dt, inputs);
    if (inputs.has(InputType.Left))
      this.steer(inputs.get(InputType.Left).value * -1);
    else if (inputs.has(InputType.Right))
      this.steer(inputs.get(InputType.Right).value * -1);
  }

  getContactForce(normalForce: number): Vector3 {
    const direction = this.getDirection();
    const contactForce =
      direction *
      this.tireModel.getForce(Math.abs(this.steeringAngle)) *
      normalForce *
      CONTACT_FORCE_COEFFICIENT;

    const { right } = MathUtility.getBasisVector(this.gameObject);
    return right.multiplyScalar(contactForce);
  }

  getDirection(): number {
    return this.steeringAngle > 0 ? -1 : 1;
  }

  updateContactForce(contactForceL: number, contactForceR: number) {
    const direction = this.getDirection();
    super.updateContactForce(
      direction * contactForceL,
      direction * contactForceR
    );
  }
}
