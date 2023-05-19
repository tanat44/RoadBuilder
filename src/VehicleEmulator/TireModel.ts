import { MathUtility } from "../Math/MathUtility";

class SlipAngleData {
  angle: number;
  force: number; // normalized

  constructor(angle: number, force: number) {
    this.angle = angle;
    this.force = force;
  }
}

export class TireModel {
  dataPoints: SlipAngleData[];

  constructor() {
    this.dataPoints = [
      new SlipAngleData(0, 0),
      new SlipAngleData(5, 0.825),
      new SlipAngleData(7, 0.93),
      new SlipAngleData(10, 1),
      new SlipAngleData(15, 0.982),
      new SlipAngleData(20, 0.947),
      new SlipAngleData(25, 0.912),
      new SlipAngleData(30, 0.895),
      new SlipAngleData(35, 0.877),
      new SlipAngleData(40, 0.842),
      new SlipAngleData(45, 0.825),
      new SlipAngleData(50, 0.825),
    ];
  }

  getForce(angle: number): number {
    const force = MathUtility.linearInterpolation(
      this.dataPoints,
      "angle",
      "force",
      angle
    );
    return force;
  }
}
