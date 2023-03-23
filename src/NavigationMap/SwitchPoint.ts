import { Vector3 } from "three";
import { CONTROL_POINT_DISTANCE } from "../Const";
import { Node } from "../Layout/Node";
import { Road } from "../Layout/Road";

export type PairSwitchPoint = {
  from: SwitchPoint;
  to: SwitchPoint;
};

export type HalfControlPoint = {
  p0: Vector3;
  p1: Vector3;
};

export class SwitchPoint {
  position: Vector3;
  road: Road;
  node: Node;

  constructor(position: Vector3, road: Road, node: Node) {
    this.position = position;
    this.road = road;
    this.node = node;
  }

  toControlPoint(inward: boolean): HalfControlPoint {
    let direction =
      this.node == this.road.from
        ? this.road.direction.clone()
        : this.road.direction.clone().multiplyScalar(-1);

    if (!inward) direction.multiplyScalar(-1);

    let hcp: HalfControlPoint = {
      p0: this.position.clone(),
      p1: this.position
        .clone()
        .add(direction.multiplyScalar(CONTROL_POINT_DISTANCE)),
    };
    return hcp;
  }

  static pairSwitchPoint(
    sps1: SwitchPoint[],
    sps2: SwitchPoint[]
  ): PairSwitchPoint[] {
    let pairs: PairSwitchPoint[] = [];
    for (let i = 0; i < sps1.length; ++i) {
      for (let j = 0; j < sps2.length; ++j) {
        pairs.push({
          from: sps1[i],
          to: sps2[j],
        });
      }
    }
    return pairs;
  }
}
