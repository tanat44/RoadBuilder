import { Object3D, Vector3 } from "three";
import * as THREE from "three";
import { Manager } from "../Manager";
import { VehicleState } from "./VehicleState";
import { Engine } from "./Engine";
import { GRAVITY, RENDER_SCALE } from "../Const";
import { AxleBrakingForce, DrivingAxle, SteeringAxle } from "./Axle";
import { DEG2RAD } from "three/src/math/MathUtils";

// ALL METRIC UNIT

type Force = Vector3;
export class Vehicle {
  // physics
  previousState: VehicleState;
  state: VehicleState;
  centerOfMass: Vector3;
  mass: number;
  friction: number;

  // car property
  engine: Engine;
  steeringAxle: SteeringAxle;
  drivingAxle: DrivingAxle;

  // rendering
  gameObject: Object3D;

  constructor() {
    // physics
    this.centerOfMass = new Vector3(0, 0.5, 0);
    this.state = new VehicleState(this.centerOfMass);
    this.previousState = new VehicleState(this.centerOfMass);
    this.mass = 1246; // brz weight
    this.friction = 500; // newton

    // car
    this.engine = Engine.brzEngine();
    this.steeringAxle = new SteeringAxle(new Vector3(1.2, 0, 0), 1.8);
    this.drivingAxle = new DrivingAxle(new Vector3(-1.2, 0, 0), 1.8);

    this.drawGameObject();
  }

  drawGameObject() {
    this.drawVehicle();
  }

  drawVehicle() {
    const width = this.steeringAxle.width;
    const length = new Vector3(1, 0, 0).dot(
      this.steeringAxle.axleCenter.clone().sub(this.drivingAxle.axleCenter)
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
    this.gameObject.add(this.drivingAxle.gameObject);

    // axis helper
    var axesHelper = new THREE.AxesHelper(400);
    Manager.instance.addGameObjectToScene(axesHelper);
    this.gameObject.add(axesHelper);

    Manager.instance.addGameObjectToScene(this.gameObject);
  }

  tick(dt: number, lastKeyPress: Set<string>) {
    if (!this.engine) return;
    this.previousState.copyState(this.state);
    this.steeringAxle.tick(dt, lastKeyPress);
    this.drivingAxle.tick(dt, lastKeyPress);
    this.engine.tick(dt, lastKeyPress);

    // Keyboard - steering
    if (lastKeyPress.has("a")) this.steeringAxle.steer(dt, 1);
    else if (lastKeyPress.has("d")) this.steeringAxle.steer(dt, -1);

    // Calculate force
    const force = this.calculateForce3();

    // Update Acc
    this.updateAcceleration(force);

    // Update Velocity
    this.updateVelocity(dt);

    // Update Position
    this.updatePosition(dt);

    // render
    this.gameObject.position.copy(
      this.state.position.clone().multiplyScalar(RENDER_SCALE)
    );

    // print
    // this.engine.printState();
    this.state.printState();
  }

  calculateForce3(): Force {
    const torqueSplitRatio = 0.5; // torque RR / torqueRL
    const torqueRL = this.engine.torque * (1 - torqueSplitRatio);
    const torqueRR = this.engine.torque * torqueSplitRatio;
    const drivingForceRL =
      this.drivingAxle.leftWheel.getDrivingForceMagnitude(torqueRL);
    const drivingForceRR =
      this.drivingAxle.leftWheel.getDrivingForceMagnitude(torqueRR);
    const drivingForceR = drivingForceRL + drivingForceRL;

    let contactForceCoeff = new Vector3(0, 0, 0);
    if (this.state.velocity.length() > 0 || this.engine.torque > 0)
      contactForceCoeff = this.steeringAxle.getContactForce(1);

    const rearAxleDistance = Math.abs(
      new Vector3(1, 0, 0).dot(this.drivingAxle.axleCenter)
    );
    const frontAxleDistance = Math.abs(
      new Vector3(1, 0, 0).dot(this.steeringAxle.axleCenter)
    );
    const wheelHeight =
      Math.abs(new Vector3(0, 1, 0).dot(this.drivingAxle.axleCenter)) +
      this.drivingAxle.leftWheel.radius;
    const length = frontAxleDistance + rearAxleDistance;
    const width = this.steeringAxle.width;
    const halfWidth = width / 2;
    const weight = this.mass * GRAVITY;

    // axle weight distribution
    const normalForceF =
      (rearAxleDistance * weight - drivingForceR * wheelHeight) / length;
    const normalForceR = weight - normalForceF;

    // front axle - normal
    const c_1 =
      (halfWidth - contactForceCoeff.length()) /
      (halfWidth + contactForceCoeff.length());
    const normalForceFR = (normalForceF * c_1) / (1 + c_1);
    const normalForceFL = normalForceF - normalForceFR;
    let contactForceFL = new Vector3(0, 0, 0);
    let contactForceFR = new Vector3(0, 0, 0);

    if (this.state.velocity.length() > 0) {
      contactForceFL = this.steeringAxle.getContactForce(normalForceFL);
      contactForceFR = this.steeringAxle.getContactForce(normalForceFR);
    }
    const fx_abs =
      drivingForceR +
      this.state.forward
        .clone()
        .dot(contactForceFL.clone().add(contactForceFR));
    const fx = this.state.forward.clone().multiplyScalar(fx_abs);

    // rear axle - normal
    let fz_rear = 0;
    const normalForceRL =
      (normalForceR * halfWidth - fz_rear * wheelHeight) / width;
    const normalForceRR = normalForceR - normalForceRL;
    const contactForceRL = (normalForceRL / normalForceR) * fz_rear;
    const contactForceRR = fz_rear - contactForceRL;

    // ackerman
    const v_abs = this.state.velocity.length();
    this.state.corneringRadius =
      -length / Math.tan(this.steeringAxle.steeringAngle * DEG2RAD);
    const fc_abs = (this.mass * (v_abs * v_abs)) / this.state.corneringRadius;

    // front axle - centrifugal
    const fz_front_pred_abs = this.state.right
      .clone()
      .dot(contactForceFL.clone().add(contactForceFR));
    let fz_front = this.state.right.clone().multiplyScalar(fz_front_pred_abs);
    if (Math.abs(fz_front_pred_abs) > Math.abs(fc_abs)) {
      console.log("override", fc_abs, this.state.corneringRadius);
      fz_front = this.state.right.clone().multiplyScalar(fc_abs);
    }

    // rear axle - centrifugal

    // braking force
    const brakeForceF = this.steeringAxle.getBrakingForce();
    const brakeForceR = this.drivingAxle.getBrakingForce();
    const brakeForce = brakeForceF.leftWheel
      .clone()
      .add(brakeForceF.rightWheel)
      .add(brakeForceR.leftWheel)
      .add(brakeForceR.rightWheel);

    // render force front
    this.steeringAxle.updateNormalForce(normalForceFL, normalForceFR);
    this.steeringAxle.updateContactForce(
      contactForceFL.length(),
      contactForceFR.length()
    );
    this.steeringAxle.updateDrivingForce(
      -brakeForceF.leftWheel.length(),
      -brakeForceF.rightWheel.length()
    );

    // render force rear
    this.drivingAxle.updateNormalForce(normalForceRL, normalForceRR);
    this.drivingAxle.updateContactForce(contactForceRL, contactForceRR);
    this.drivingAxle.updateDrivingForce(
      drivingForceRL - brakeForceR.leftWheel.length(),
      drivingForceRR - brakeForceR.rightWheel.length()
    );

    // friction
    const friction = this.state.forward.clone().multiplyScalar(-this.friction);

    // total force
    const forceTotal = fx.clone().add(fz_front).add(friction).add(brakeForce);
    return forceTotal;
  }

  updateAcceleration(force: Force) {
    this.state.acceleration = force.clone().multiplyScalar(1 / this.mass);
  }

  updateVelocity(dt: number) {
    // linear
    const dv_abs = this.state.acceleration.dot(this.state.forward) * dt;
    const v_abs = this.state.velocity.length() + dv_abs;
    if (v_abs < 0) {
      this.state.velocity.set(0, 0, 0);
      return;
    }

    // rotate
    const dz_abs = this.state.acceleration.dot(this.state.right) * dt;
    const dz = this.state.right.clone().multiplyScalar(dz_abs);
    const v = this.state.velocity
      .clone()
      .add(dz)
      .normalize()
      .multiplyScalar(v_abs);
    if (v.length() < 0.001) {
      const dv = this.state.acceleration.clone().multiplyScalar(dt);
      v.copy(dv);
    }

    this.state.velocity.copy(v);
  }

  updatePosition(dt: number) {
    this.state.position.add(this.state.velocity.clone().multiplyScalar(dt));

    const dx = this.state.position.clone().sub(this.previousState.position);
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(this.state.forward, dx);
    this.gameObject.applyQuaternion(q);
    this.state.updateDirection(this.gameObject.matrixWorld);
  }
}
