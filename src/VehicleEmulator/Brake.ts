import {Input, InputType} from "../Input";

export class Brake {
  pedalForce: number; // 0 to 1
  maxBrakingForce: number; // Newton
  brakingEffect: number; // normalized pedalForce over time

  constructor() {
    this.pedalForce = 0;
    this.maxBrakingForce = 4000;
    this.brakingEffect = 2;
  }

  tick(dt: number, inputs: Map<InputType, Input>) {
    if (!inputs.has(InputType.Down)) {
      this.pedalForce = 0;
      return;
    }

    let f = this.pedalForce + dt * this.brakingEffect;
    if (f > 1) f = 1;
    this.pedalForce = f;
  }

  getBrakingForce(): number {
    return this.pedalForce * this.maxBrakingForce;
  }
}
