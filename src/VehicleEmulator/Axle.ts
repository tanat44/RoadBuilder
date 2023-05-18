import { Group, Object3D, Vector3 } from "three";
import { Wheel } from "./Wheel";
import { STEERING_SPEED } from "../Const";

export class Axle {
  axleCenter: Vector3;
  width: number;

  leftWheel: Wheel;
  rightWheel: Wheel;
  gameObject: Group;

  constructor(axleCenter: Vector3, width: number) {
    this.axleCenter = axleCenter;
    this.width = width;

    const leftHubCenter = axleCenter.clone().add(new Vector3(0, 0, -width / 2));
    const rightHubCenter = axleCenter.clone().add(new Vector3(0, 0, width / 2));
    this.leftWheel = new Wheel(leftHubCenter, true, false);
    this.rightWheel = new Wheel(rightHubCenter, true, false);

    this.gameObject = new Group();
    this.gameObject.add(this.leftWheel.gameObject);
    this.gameObject.add(this.rightWheel.gameObject);
  }

  updateNormalForce(normalForceL: number, normalForceR: number) {
    this.leftWheel.updateForce(normalForceL, 0);
    this.rightWheel.updateForce(normalForceR, 0);
  }
}

export class SteeringAxle extends Axle {
  steeringAngle: number;
  maxSteeringAngle: number; // degree

  constructor(axleCenter: Vector3, width: number) {
    super(axleCenter, width);
    this.steeringAngle = 0;
    this.maxSteeringAngle = 40;
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
}
