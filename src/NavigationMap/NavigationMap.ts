import { Segment } from "../Layout/Segment";
import { SwitchPoint } from "./SwitchPoint";

export class NavigationMap {
  segments: Segment[];
  switchPoints: SwitchPoint[];

  constructor() {
    this.segments = [];
    this.switchPoints = [];
  }
}
