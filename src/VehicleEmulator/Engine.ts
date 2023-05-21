import { MathUtility } from "../Math/MathUtility";
import { Input, InputType } from "../Input";

export type Torque = number;
export type GearRatio = number;

export class EngineDataPoint {
  rpm: number;
  torque: Torque; // kgm
  power: number; // kwh

  constructor(rpm: number, torque: Torque, power: number) {
    this.rpm = rpm;
    this.torque = torque;
    this.power = power;
  }
}

export class Engine {
  torquePowerProfile: EngineDataPoint[];
  rpm: number;
  torque: Torque;
  accelerationRate: number; // rpm per second of accel
  finalDriveRatio: number;
  gearRatios: GearRatio[];
  currentGear: number;

  constructor(torquePowerProfile: EngineDataPoint[]) {
    this.torquePowerProfile = torquePowerProfile;
    this.rpm = this.torquePowerProfile[0].rpm;
    this.torque = 0;
    this.accelerationRate = 200;
    this.finalDriveRatio = 4.1; // brz
    this.gearRatios = [3.62, 2.18, 1.54, 1.21, 1.0, 0.76];
    this.currentGear = 0;
  }

  accelerate(pedalValue: number) {
    // pedalValue = 0 to 1
    const maxRpm =
      this.torquePowerProfile[this.torquePowerProfile.length - 1].rpm;
    this.rpm = pedalValue * maxRpm;
    this.torque = this.getTorque(this.rpm);
  }

  getTorque(rpm: number): Torque {
    const engineTorque = MathUtility.linearInterpolation(
      this.torquePowerProfile,
      "rpm",
      "torque",
      rpm
    );

    return (
      engineTorque * this.finalDriveRatio * this.gearRatios[this.currentGear]
    );
  }

  tick(dt: number, inputs: Map<InputType, Input>) {
    if (inputs.has(InputType.Up)) {
      const input = inputs.get(InputType.Up);
      this.accelerate(input.value);
    }
  }

  static brzEngine() {
    const torquePowerProfile: EngineDataPoint[] = [
      new EngineDataPoint(0, 0, 0),
      new EngineDataPoint(1000, 140, 20),
      new EngineDataPoint(2000, 160, 40),
      new EngineDataPoint(3000, 200, 70),
      new EngineDataPoint(4000, 180, 70),
      new EngineDataPoint(5000, 200, 210),
      new EngineDataPoint(6000, 200, 260),
      new EngineDataPoint(7000, 200, 300),
    ];
    const engine = new Engine(torquePowerProfile);
    return engine;
  }

  printState() {
    console.log(
      `rpm = ${this.rpm.toFixed(0)} torque = ${this.torque.toFixed(0)}`
    );
  }
}
