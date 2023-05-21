import { Group, Vector3 } from "three";
import { Wheel } from "./Wheel";
import { Input, InputType } from "../Input";

export type AxleBrakingForce = {
  leftWheel: Vector3;
  rightWheel: Vector3;
};
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

  getBrakingForce(): AxleBrakingForce {
    return {
      leftWheel: this.leftWheel.getBrakingForce(),
      rightWheel: this.rightWheel.getBrakingForce(),
    };
  }

  renderSlipWheel(leftSlip: boolean, rightSlip: boolean) {
    this.leftWheel.renderSlip(leftSlip);
    this.rightWheel.renderSlip(rightSlip);
  }
}
