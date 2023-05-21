import { IController, Input, InputType } from "../IController";

enum ClampingType {
  Positive, // 0 to 1
  Negative, // -1 to 0
  Both, // -1 to 1
}
export class KeyboardController implements IController {
  private inputs: Map<InputType, Input> = new Map();
  private readonly onKeyUp: (e: KeyboardEvent) => void;
  private readonly onKeyDown: (e: KeyboardEvent) => void;

  // rate of change
  private accelerationRate: number;
  private brakingRate: number;
  private steeringRate: number;

  // absolute value
  private accelerationValue: number;
  private brakingValue: number;
  private steeringValue: number;

  private activeInput: Set<InputType>;

  get currentInputs(): Map<InputType, Input> {
    return this.inputs;
  }

  constructor() {
    // rate of change
    this.accelerationRate = 1;
    this.brakingRate = 1;
    this.steeringRate = 2;

    // absolute value
    this.accelerationValue = 0;
    this.brakingValue = 0;
    this.steeringValue = 0;

    this.activeInput = new Set();

    this.onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "w" || e.key === "ArrowUp") {
        this.activeInput.add(InputType.Up);
      }
      if (e.key === "s" || e.key === "ArrowDown") {
        this.activeInput.add(InputType.Down);
      }
      if (e.key === "a" || e.key === "ArrowLeft") {
        this.activeInput.add(InputType.Left);
      }
      if (e.key === "d" || e.key === "ArrowRight") {
        this.activeInput.add(InputType.Right);
      }
    };

    this.onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "w" || e.key === "ArrowUp") {
        this.activeInput.delete(InputType.Up);
      }
      if (e.key === "s" || e.key === "ArrowDown") {
        this.activeInput.delete(InputType.Down);
      }
      if (e.key === "a" || e.key === "ArrowLeft") {
        this.activeInput.delete(InputType.Left);
      }
      if (e.key === "d" || e.key === "ArrowRight") {
        this.activeInput.delete(InputType.Right);
      }
    };

    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("keydown", this.onKeyDown);
  }

  static clampValue(value: number, clampOption: ClampingType): number {
    if (clampOption === ClampingType.Positive) {
      if (value > 1) return 1;
      else if (value < 0) return 0;
      return value;
    } else if (clampOption === ClampingType.Negative) {
      if (value > 0) return 0;
      else if (value < -1) return -1;
      return value;
    }
    // ClampingType.Both
    if (value > 1) return 1;
    else if (value < -1) return -1;
    return value;
  }

  setInput(type: InputType, value: number) {
    this.inputs.set(type, { name: type, value: value });
  }

  interpolateInput?(dt: number) {
    // Accelerate
    if (this.activeInput.has(InputType.Up)) {
      this.accelerationValue += dt * this.accelerationRate;
    } else {
      this.accelerationValue = 0; // full lift off
    }
    this.accelerationValue = KeyboardController.clampValue(
      this.accelerationValue,
      ClampingType.Positive
    );
    this.setInput(InputType.Up, this.accelerationValue);

    // Brake
    if (this.activeInput.has(InputType.Down)) {
      this.brakingValue += dt * this.brakingRate;
    } else {
      this.brakingValue = 0; // full lift off
    }
    this.brakingValue = KeyboardController.clampValue(
      this.brakingValue,
      ClampingType.Positive
    );
    this.setInput(InputType.Down, this.brakingValue);

    // Steer
    // Do not allow steer both direction at a moment
    if (
      this.activeInput.has(InputType.Left) &&
      this.activeInput.has(InputType.Right)
    ) {
      this.activeInput.delete(InputType.Left);
      this.activeInput.delete(InputType.Right);
    }

    if (this.activeInput.has(InputType.Left)) {
      this.steeringValue -= dt * this.steeringRate;
    } else if (this.activeInput.has(InputType.Right)) {
      this.steeringValue += dt * this.steeringRate;
    }
    this.steeringValue = KeyboardController.clampValue(
      this.steeringValue,
      ClampingType.Both
    );
    if (this.steeringValue < 0) {
      this.setInput(InputType.Left, this.steeringValue);
      this.inputs.delete(InputType.Right);
    } else {
      this.setInput(InputType.Right, this.steeringValue);
      this.inputs.delete(InputType.Left);
    }
  }

  print() {
    console.log(
      `a=${this.accelerationValue.toFixed(2)}, b=${this.brakingValue.toFixed(
        2
      )}, s=${this.steeringValue.toFixed(2)}`
    );
  }

  dispose() {
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("keydown", this.onKeyDown);
  }
}
