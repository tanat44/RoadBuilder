import * as THREE from "three";
import {Object3D, Vector3} from "three";
import {Manager} from "../Manager";
import {VehicleState} from "./VehicleState";
import {Wheel} from "./Wheel";
import {Engine} from "./Engine";
import {GRAVITY, RENDER_SCALE} from "../Const";
import {SteeringAxle} from "./Axle";
import {Input, InputType} from "../Controls/IControls";

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

  tick(dt: number, inputs: Map<InputType, Input>) {
    if (!this.engine) return;
    this.previousState.copyState(this.state);

    // Keyboard - accel / brake
    if (inputs.has(InputType.Up)) this.engine.accelerate(dt);
    else if (inputs.has(InputType.Down)) {
    } else this.engine.coast();

    // Keyboard - steering
    if (inputs.has(InputType.Left)) this.steeringAxle.steer(dt, 1);
    else if (inputs.has(InputType.Right)) this.steeringAxle.steer(dt, -1);

    // Calculate force
    const force = this.calculateForce3();

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

  calculateForce3(): Force {
    const torqueSplitRatio = 0.5; // torque RR / torqueRL
    const torqueRL = this.engine.torque * (1 - torqueSplitRatio);
    const torqueRR = this.engine.torque * torqueSplitRatio;
    const drivingForceRL = this.wheelRL.getDrivingForceMagnitude(torqueRL);
    const drivingForceRR = this.wheelRR.getDrivingForceMagnitude(torqueRR);
    const drivingForceR = drivingForceRL + drivingForceRL;

    let contactForceCoeff = new Vector3(0, 0, 0);
    if (this.state.velocity.length() > 0 || this.engine.torque > 0)
      contactForceCoeff = this.steeringAxle.getContactForce(1);
    const contactForceCoeffX = this.state.forward
      .clone()
      .dot(contactForceCoeff);
    const contactForceCoeffZ = this.state.right.clone().dot(contactForceCoeff);

    const rearAxleDistance = Math.abs(
      new Vector3(1, 0, 0).dot(this.wheelRL.hubCenter)
    );
    const frontAxleDistance = Math.abs(
      new Vector3(1, 0, 0).dot(this.steeringAxle.axleCenter)
    );
    const wheelHeight =
      Math.abs(new Vector3(0, 1, 0).dot(this.wheelRL.hubCenter)) +
      this.wheelRL.radius;
    const length = frontAxleDistance + rearAxleDistance;
    const width = this.steeringAxle.width;
    const halfWidth = width / 2;
    const weight = this.mass * GRAVITY;

    // XZ plane
    const normalForceF =
      (rearAxleDistance * weight - drivingForceR * wheelHeight) /
      (length + 2 * contactForceCoeffX * wheelHeight);
    const normalForceR = weight - normalForceF;

    // FrontAxle
    const c_1 =
      (halfWidth - contactForceCoeffZ) / (halfWidth + contactForceCoeffZ);
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

    // centrifugal force
    const v_abs = this.state.velocity.length();
    const ac = (v_abs * v_abs) / this.state.corneringRadius;
    let fc_abs = this.mass * ac;
    const fz_front_abs = this.state.right
      .clone()
      .dot(contactForceFL.clone().add(contactForceFR));
    let fz_rear = 0;
    let fz = new Vector3(0, 0, 0);

    if (Math.abs(fc_abs) > Math.abs(fz_front_abs)) {
      // rear wheel help provide cornering force
      fz_rear = fc_abs - fz_front_abs;
      fz = this.state.right.clone().multiplyScalar(fc_abs);
      console.log("a");
    } else {
      // only front wheel provide cornering force
      fz_rear = 0;
      fz = this.state.right.clone().multiplyScalar(fz_front_abs);
    }

    // RearAxle
    const normalForceRL =
      (normalForceR * halfWidth - fz_rear * wheelHeight) / width;
    const normalForceRR = normalForceR - normalForceRL;
    const contactForceRL = (normalForceRL / normalForceR) * fz_rear;
    const contactForceRR = fz_rear - contactForceRL;

    // render force front
    this.steeringAxle.updateNormalForce(normalForceFL, normalForceFR);
    this.steeringAxle.updateContactForce(contactForceFL, contactForceFR);

    // render force rear
    this.wheelRL.wheelForceObject.updateForce(normalForceRL, drivingForceRL);
    this.wheelRL.wheelForceObject.updateContactForce(contactForceRL);
    this.wheelRR.wheelForceObject.updateForce(normalForceRR, drivingForceRR);
    this.wheelRR.wheelForceObject.updateContactForce(contactForceRR);

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
