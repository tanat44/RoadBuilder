import { Group, Object3D, Vector3 } from "three";
import { Wheel } from "./Wheel";
import { CONTACT_FORCE_COEFFICIENT, STEERING_SPEED } from "../Const";
import { TireModel } from "./TireModel";
import { MathUtility } from "../Math/MathUtility";
import {Input, InputType} from "../Input";

export class Axle {
  axleCenter: Vector3;
  width: number;

  leftWheel: Wheel;
  rightWheel: Wheel;
  gameObject: Group;

  constructor(
    axleCenter: Vector3,
    width: number,
    steerable: boolean,
    drivable: boolean
  ) {
    this.axleCenter = axleCenter;
    this.width = width;

    const leftHubCenter = axleCenter.clone().add(new Vector3(0, 0, -width / 2));
    const rightHubCenter = axleCenter.clone().add(new Vector3(0, 0, width / 2));
    this.leftWheel = new Wheel(leftHubCenter, steerable, drivable);
    this.rightWheel = new Wheel(rightHubCenter, steerable, drivable);

    this.gameObject = new Group();
    this.gameObject.add(this.leftWheel.gameObject);
    this.gameObject.add(this.rightWheel.gameObject);
  }

  updateNormalForce(normalForceL: number, normalForceR: number) {
    this.leftWheel.wheelForceObject.updateNormalForce(normalForceL);
    this.rightWheel.wheelForceObject.updateNormalForce(normalForceR);
  }

  updateContactForce(contactForceL: number, contactForceR: number) {
    this.leftWheel.wheelForceObject.updateContactForce(contactForceL);
    this.rightWheel.wheelForceObject.updateContactForce(contactForceR);
  }

  updateDrivingForce(drivingForceL: number, drivingForceR: number) {
    this.leftWheel.wheelForceObject.updateDrivingForce(drivingForceL);
    this.rightWheel.wheelForceObject.updateDrivingForce(drivingForceL);
  }

  tick(dt: number, inputs: Map<InputType, Input>) {
    this.leftWheel.tick(dt, inputs);
    this.rightWheel.tick(dt, inputs);
  }
}

export class DrivingAxle extends Axle {
  tireModel: TireModel;

  constructor(axleCenter: Vector3, width: number) {
    super(axleCenter, width, false, true);
    this.tireModel = new TireModel();
  }
}

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

  steer(dt: number, direction: number) {
    const deltaAngle = dt * STEERING_SPEED * direction;
    if (this.steeringAngle + deltaAngle > this.maxSteeringAngle) {
      this.steeringAngle = this.maxSteeringAngle;
    } else if (this.steeringAngle + deltaAngle < -this.maxSteeringAngle) {
      this.steeringAngle = -this.maxSteeringAngle;
    } else {
      this.steeringAngle += deltaAngle;
    }

    this.leftWheel.steer(this.steeringAngle);
    this.rightWheel.steer(this.steeringAngle);
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
