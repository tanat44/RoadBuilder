import { Vector3 } from "three";

export type EndPointControlPoints = {
  nearPoint: Vector3;
  farPoint: Vector3;
};

export type PairControlPoints = {
  cp1: EndPointControlPoints;
  cp2: EndPointControlPoints;
};
