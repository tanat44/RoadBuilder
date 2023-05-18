import { Object3D, Vector3 } from "three";
import * as THREE from "three";
import { Manager } from "../Manager";
import { VehicleState } from "./VehicleState";
import { Wheel } from "./Wheel";
import { Engine, Torque } from "./Engine";
import { GRAVITY, RENDER_SCALE } from "../Const";
import { SteeringAxle } from "./Axle";

// ALL METRIC UNIT

type Force = Vector3;
export class Vehicle {
  // physics
  previousState: VehicleState;
  state: VehicleState;
  centerOfMass: Vector3;
  mass: number;

  // car property
  engine: Engine;
  steeringAxle: SteeringAxle;
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
    this.steeringAxle = new SteeringAxle(new Vector3(1.2, 0, 0), 1.8);
    this.wheelRL = new Wheel(new Vector3(-1.2, 0, -0.9), false, true);
    this.wheelRR = new Wheel(new Vector3(-1.2, 0, 0.9), false, true);

    this.drawGameObject();
  }

  drawGameObject() {
    this.drawVehicle();
  }

  drawVehicle() {
    const width = this.steeringAxle.width;
    const length = new Vector3(1, 0, 0).dot(
      this.steeringAxle.leftWheel.hubCenter.clone().sub(this.wheelRL.hubCenter)
    );
    const box = new THREE.BoxGeometry(
      length * RENDER_SCALE,
      0.1,
      width * RENDER_SCALE
    );
    const material = new THREE.MeshStandardMaterial();
    material.color.setHex(0x000000);
    material.transparent = true;
    material.opacity = 0.3;
    this.gameObject = new THREE.Mesh(box, material);
    this.gameObject.position.copy(
      this.centerOfMass.clone().multiplyScalar(RENDER_SCALE)
    );

    // wheels
    this.gameObject.add(this.steeringAxle.gameObject);
    this.gameObject.add(this.wheelRL.gameObject);
    this.gameObject.add(this.wheelRR.gameObject);

    // axis helper
    var axesHelper = new THREE.AxesHelper(400);
    Manager.instance.addGameObjectToScene(axesHelper);
    this.gameObject.add(axesHelper);

    Manager.instance.addGameObjectToScene(this.gameObject);
  }

  tick(dt: number, lastKeyPress: Set<string>) {
    if (!this.engine) return;

    this.previousState.copyState(this.state);

    // Update Force

    // driving
    if (lastKeyPress.has("w")) this.engine.accelerate(dt);
    else if (lastKeyPress.has("s")) {
    } else this.engine.coast();

    // steering
    if (lastKeyPress.has("a")) this.steeringAxle.steer(dt, 1);
    else if (lastKeyPress.has("d")) this.steeringAxle.steer(dt, -1);

    const force = this.calculateForce();

    // Update Acc
    this.updateAcceleration(force);

    // Update Velocity
    this.updateVelocity(dt);
    // console.log(this.state.velocity);

    // Update Position
    this.updatePosition(dt);

    // render
    this.gameObject.position.copy(
      this.state.position.clone().multiplyScalar(RENDER_SCALE)
    );

    // print
    // this.engine.printState();
    // this.printVelocity();
  }

  calculateNormalForce() {}

  calculateForce(): Force {
    // x axis (front-back)
    const torqueSplitRatio = 0.5; // torque RR / torqueRL
    const torqueRL = this.engine.torque * (1 - torqueSplitRatio);
    const torqueRR = this.engine.torque * torqueSplitRatio;

    const drivingForceRL = this.wheelRL.getDrivingForceMagnitude(torqueRL);
    const drivingForceRR = this.wheelRR.getDrivingForceMagnitude(torqueRR);
    const engineForce = drivingForceRL + drivingForceRR;
    const dragForce = 0;
    const fx_norm = engineForce + dragForce;
    const fx = this.state.forward.clone().multiplyScalar(fx_norm);

    // y axis (normal)
    const rearHubDistance =
      Math.abs(this.wheelRL.hubCenter.x + this.wheelRR.hubCenter.x) / 2;
    const frontHubDistance = this.steeringAxle.axleCenter.x;
    const tyreContactDistance =
      Math.abs(this.wheelRL.hubCenter.y + this.wheelRR.hubCenter.y) / 2 +
      this.wheelRL.radius;
    const W = this.mass * GRAVITY;
    const normalForceR =
      (fx_norm * tyreContactDistance + W * frontHubDistance) /
      (rearHubDistance + frontHubDistance);
    const normalForceF = W - normalForceR;

    const normalForceRL = normalForceR / 2;
    const normalForceRR = normalForceR / 2;
    const normalForceFL = normalForceF / 2;
    const normalForceFR = normalForceF / 2;

    // z axis (left-night)
    let contactForceFL = new Vector3(0, 0, 0);
    let contactForceFR = new Vector3(0, 0, 0);
    if (this.state.velocity.length() > 0) {
      contactForceFL = this.steeringAxle.getContactForce(normalForceFL);
      contactForceFR = this.steeringAxle.getContactForce(normalForceFR);
    }
    const right = this.state.right.clone();
    const fz = right
      .clone()
      .multiplyScalar(contactForceFL.clone().add(contactForceFR).dot(right));

    // render force
    this.wheelRL.wheelForceObject.updateForce(normalForceRL, drivingForceRL);
    this.wheelRR.wheelForceObject.updateForce(normalForceRR, drivingForceRR);
    this.steeringAxle.updateNormalForce(normalForceFL, normalForceFR);
    this.steeringAxle.updateContactForce(contactForceFL, contactForceFR);
    return fx.clone().add(fz);
  }

  updateAcceleration(force: Force) {
    this.state.acceleration = force.clone().multiplyScalar(1 / this.mass);
  }

  updateVelocity(dt: number) {
    this.state.velocity.add(this.state.acceleration.clone().multiplyScalar(dt));
  }

  updatePosition(dt: number) {
    this.state.position.add(this.state.velocity.clone().multiplyScalar(dt));

    const dx = this.state.position.clone().sub(this.previousState.position);
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(this.state.forward, dx);
    this.gameObject.applyQuaternion(q);
    this.state.updateDirection(this.gameObject.matrixWorld);
  }

  printVelocity() {
    const v = this.state.velocity.length();
    console.log(`Velocity = ${((v * 18) / 5).toFixed(0)}`);
  }
}
