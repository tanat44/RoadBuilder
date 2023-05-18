import * as THREE from "three";
import { Object3D, Vector3 } from "three";
import { Manager } from "../Manager";
import { DEG2RAD } from "three/src/math/MathUtils";

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

  revMatch(wheelAngularVelocity: number) {
    const engineRpm = wheelAngularVelocity * this.finalDriveRatio;
    this.setRpm(engineRpm);
  }

  accelerate(dt: number) {
    this.rpm += 1000 * dt;

    const maxRpm =
      this.torquePowerProfile[this.torquePowerProfile.length - 1].rpm;
    if (this.rpm > maxRpm) this.rpm = maxRpm;
    this.setRpm(this.rpm);
  }

  coast() {
    this.setRpm(0);
  }

  setRpm(rpm: Torque) {
    this.rpm = rpm;
    this.torque = this.getTorque(rpm);
  }

  getTorque(rpm: number): Torque {
    let upperIdx: number;
    for (upperIdx = 1; upperIdx < this.torquePowerProfile.length; upperIdx++) {
      if (rpm > this.torquePowerProfile[upperIdx].rpm) continue;
      else break;
    }

    if (upperIdx == this.torquePowerProfile.length)
      return this.torquePowerProfile[this.torquePowerProfile.length - 1].torque;

    const lowerIdx = upperIdx - 1;
    const upperData = this.torquePowerProfile[upperIdx];
    const lowerData = this.torquePowerProfile[lowerIdx];

    const torque =
      lowerData.torque +
      ((upperData.torque - lowerData.torque) /
        (upperData.rpm - lowerData.rpm)) *
        (rpm - lowerData.rpm);

    return torque * this.finalDriveRatio * this.gearRatios[this.currentGear];
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
