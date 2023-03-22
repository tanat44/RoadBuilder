import { Object3D } from "three";

export class Edge {
  gameObject: Object3D;
  numberOfLanes: number;
  from: Node;
  to: Node;

  constructor(gameObject: Object3D, from: Node, to: Node) {
    this.numberOfLanes = 2;
    this.gameObject = gameObject;
    this.from = from
    this.to = to
  }
}
