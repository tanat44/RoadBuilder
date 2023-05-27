import { Input, InputType } from "../Input";

export class Brake {
  private brakingForce: number; // 0 to 1
  private maxBrakingForce: number; // Newton

  constructor() {
    this.brakingForce = 0;
    this.maxBrakingForce = 4000;
  }

  tick(dt: number, inputs: Map<InputType, Input>) {
    if (inputs.has(InputType.Down)) {
      const input = inputs.get(InputType.Down);
      this.brakingForce = input.value * this.maxBrakingForce;
    }
  }

  getBrakingForce(): number {
    return this.brakingForce;
  }
}
