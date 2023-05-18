import * as THREE from "three";
import { Vector3, Matrix3 } from "three";

export type ClosestPoint = {
  pointOnA: Vector3;
  distanceOnA: number;
  pointOnB: Vector3;
  distanceOnB: number;
};

export class MathUtility {
  static findClosestPoint(a0: Vector3, a: Vector3, b0: Vector3, b: Vector3) {
    // Implement from algorithm in this link
    // https://math.stackexchange.com/questions/1993953/closest-points-between-two-lines
    a = a.clone().normalize();
    b = b.clone().normalize();
    const c = a.clone().cross(b).normalize();

    // A T = B
    // T = [t1, t2, t3]
    const A: Matrix3 = new Matrix3();
    A.set(-a.x, b.x, c.x, -a.y, b.y, c.y, -a.z, b.z, c.z);
    const Ainv = A.clone().invert();
    const B: Vector3 = a0.clone().sub(b0);
    const T = B.clone().applyMatrix3(Ainv);
    const output: ClosestPoint = {
      pointOnA: a0.clone().add(a.clone().multiplyScalar(T.x)),
      distanceOnA: T.x,
      pointOnB: b0.clone().add(b.clone().multiplyScalar(T.y)),
      distanceOnB: T.y,
    };
    return output;
  }

  static linearInterpolation(
    dataPoints: any[],
    inputFieldName: string,
    outputFieldName: string,
    inputValue: number
  ) {
    let upperIdx: number;
    for (upperIdx = 1; upperIdx < dataPoints.length; upperIdx++) {
      if (inputValue > dataPoints[upperIdx][inputFieldName]) continue;
      else break;
    }

    if (upperIdx == dataPoints.length)
      return dataPoints[dataPoints.length - 1][inputFieldName];

    const lowerIdx = upperIdx - 1;
    const upperData = dataPoints[upperIdx];
    const lowerData = dataPoints[lowerIdx];

    const outputValue =
      lowerData[outputFieldName] +
      ((upperData[outputFieldName] - lowerData[outputFieldName]) /
        (upperData[inputFieldName] - lowerData[inputFieldName])) *
        (inputValue - lowerData[inputFieldName]);

    return outputValue;
  }
}
