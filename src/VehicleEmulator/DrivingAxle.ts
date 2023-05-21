import { Vector3 } from "three";
import { Axle } from "./Axle";
import { TireModel } from "./TireModel";

export class DrivingAxle extends Axle {
  tireModel: TireModel;

  constructor(axleCenter: Vector3, width: number) {
    super(axleCenter, width, false, true);
    this.tireModel = new TireModel();
  }
}
