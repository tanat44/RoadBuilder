import { Object3D, Vector3 } from "three";
import * as THREE from "three";
import { Manager } from "../Manager";
import { DEG2RAD } from "three/src/math/MathUtils";
import { VehicleState } from "./VehicleState";
import { Wheel } from "./Wheel";
import { Engine, Torque } from "./Engine";
import { RENDER_SCALE } from "../Const";
import { VectorUtility } from "../VectorUtility";

// ALL METRIC UNIT

type ForceState = {
  driveRL: number;
  driveRR: number;
};
export class Vehicle {
  // physics
  previousState: VehicleState;
  state: VehicleState;
  centerOfMass: Vector3;
  mass: number;

  // car property
  engine: Engine;
  wheelFL: Wheel;
  wheelFR: Wheel;
  wheelRL: Wheel;
  wheelRR: Wheel;

  // rendering
  gameObject: Object3D;

  constructor() {
    // physics
    this.centerOfMass = new Vector3(0, 0.5, 0);
    this.state = new VehicleState(this.centerOfMass);
    this.previousState = new VehicleState(this.centerOfMass);
    this.mass = 1246; // 1200kg

    // car
    this.engine = Engine.brzEngine();
    this.wheelFL = new Wheel(new Vector3(2, 0, -1), true);
    this.wheelFR = new Wheel(new Vector3(2, 0, 1), true);
    this.wheelRL = new Wheel(new Vector3(-2, 0, -1));
    this.wheelRR = new Wheel(new Vector3(-2, 0, 1));

    this.drawGameObject();
  }

  drawGameObject() {
    this.drawVehicle();
  }

  drawVehicle() {
    const width = new Vector3(0, 0, 1).dot(
      this.wheelFL.hubCenter.clone().sub(this.wheelFR.hubCenter)
    );
    const length = new Vector3(1, 0, 0).dot(
      this.wheelFL.hubCenter.clone().sub(this.wheelRL.hubCenter)
    );
    const box = new THREE.BoxGeometry(
      length * RENDER_SCALE,
      0.1,
      width * RENDER_SCALE
    );
    const material = new THREE.MeshStandardMaterial();
    material.color.setHex(0xdddddd);
    this.gameObject = new THREE.Mesh(box, material);
    this.gameObject.position.copy(
      this.centerOfMass.clone().multiplyScalar(RENDER_SCALE)
    );
    Manager.instance.addGameObjectToScene(this.gameObject);

    // wheels
    this.gameObject.add(this.wheelFL.gameObject);
    this.gameObject.add(this.wheelFR.gameObject);
    this.gameObject.add(this.wheelRL.gameObject);
    this.gameObject.add(this.wheelRR.gameObject);

    // axis helper
    var axesHelper = new THREE.AxesHelper(400);
    Manager.instance.addGameObjectToScene(axesHelper);
    this.gameObject.add(axesHelper);
  }

  tick(dt: number) {
    if (!this.engine) return;

    this.previousState.copyState(this.state);

    // Update Force
    this.engine.accelerate(dt);
    // this.engine.printState();

    // Update Acc
    this.updateAcceleration();

    // Update Velocity
    this.updateVelocity(dt);
    console.log(this.state.velocity);

    // Update Position
    this.updatePosition(dt);
    this.gameObject.position.copy(
      this.state.position.clone().multiplyScalar(RENDER_SCALE)
    );
  }

  updateAcceleration() {
    const torqueSplitRatio = 0.5; // torque RR / torqueRL

    const torqueRL = this.engine.torque * (1 - torqueSplitRatio);
    const torqueRR = this.engine.torque * torqueSplitRatio;

    const drivingForceRL = this.wheelRL.getDrivingForceMagnitude(torqueRL);
    const drivingForceRR = this.wheelRR.getDrivingForceMagnitude(torqueRR);

    const totalForwardForce = drivingForceRL + drivingForceRR;

    const a = totalForwardForce / this.mass;
    this.state.acceleration = this.state.forward.clone().multiplyScalar(a);
  }

  updateVelocity(dt: number) {
    this.state.velocity.add(this.state.acceleration.clone().multiplyScalar(dt));
  }

  updatePosition(dt: number) {
    this.state.position.add(this.state.velocity.clone().multiplyScalar(dt));
  }
}
