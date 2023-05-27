import * as THREE from "three";
import { Object3D, Vector3, Mesh } from "three";
import { Manager } from "../Manager";
import { DEG2RAD } from "three/src/math/MathUtils";
import { RENDER_SCALE } from "../Const";
import { Torque } from "./Engine";
import { WheelForceRenderObject } from "./WheelForceRenderObject";
import { Brake } from "./Brake";
import { MathUtility } from "../Math/MathUtility";
import { Input, InputType } from "../Input";
export class Wheel {
  radius: number; // m
  hubCenter: Vector3; // from center of mass
  steeringAngle: number;
  steerable: boolean;
  drivable: boolean;
  mass: number; // kg
  rotationMass: number; // moment of inertia
  brake: Brake;

  // render
  gameObject: Object3D;
  wheelModel: Mesh;
  wheelForceObject: WheelForceRenderObject;

  // static
  static slippingMaterial: THREE.MeshStandardMaterial;
  static steerWheelMaterial: THREE.MeshStandardMaterial;
  static driveWheelMaterial: THREE.MeshStandardMaterial;

  constructor(hubCenter: Vector3, steerable: boolean, drivable: boolean) {
    this.radius = 0.5;
    this.hubCenter = hubCenter;
    this.steeringAngle = 0;
    this.steerable = steerable;
    this.drivable = drivable;
    this.mass = 7;
    this.rotationMass = Wheel.momentOfInertia(
      this.mass,
      this.radius,
      this.radius - 0.1 // wheel thickness is 0.1 m
    );
    this.brake = new Brake();

    // rendering
    this.render();
    this.wheelForceObject = new WheelForceRenderObject(this.radius);
    this.wheelForceObject.setParent(this.gameObject);

    // static
  }

  static {
    Wheel.slippingMaterial = new THREE.MeshStandardMaterial();
    Wheel.slippingMaterial.color.setHex(0xff0055);

    Wheel.steerWheelMaterial = new THREE.MeshStandardMaterial();
    Wheel.steerWheelMaterial.color.setHex(0x8888ff);

    Wheel.driveWheelMaterial = new THREE.MeshStandardMaterial();
    Wheel.driveWheelMaterial.color.setHex(0x4444ff);
  }

  render() {
    const cylinder = new THREE.CylinderGeometry(
      this.radius * RENDER_SCALE,
      this.radius * RENDER_SCALE,
      0.1 * RENDER_SCALE
    );
    let material = this.steerable
      ? Wheel.steerWheelMaterial
      : Wheel.driveWheelMaterial;
    this.wheelModel = new THREE.Mesh(cylinder, material);
    this.wheelModel.rotateX(90 * DEG2RAD);
    this.gameObject = new THREE.Group();
    this.gameObject.add(this.wheelModel);
    this.gameObject.position.copy(
      this.hubCenter.clone().multiplyScalar(RENDER_SCALE)
    );
    this.steer(this.steeringAngle);

    Manager.instance.addGameObjectToScene(this.gameObject);
  }

  steer(newAngle: number) {
    if (!this.steerable) return;
    this.steeringAngle = newAngle;
    this.gameObject.setRotationFromQuaternion(
      this.getRotation(this.steeringAngle)
    );
    Manager.instance.render();
  }

  getRotation(angle: number): THREE.Quaternion {
    const q = new THREE.Quaternion();
    q.setFromEuler(new THREE.Euler(0, this.steeringAngle * DEG2RAD, 0));
    return q;
  }

  getDrivingForceMagnitude(torque: Torque): number {
    return torque / this.radius;
  }

  static momentOfInertia(mass: number, r1: number, r2: number) {
    return mass * (r1 * r1 + r2 * r2);
  }

  getBrakingForce(): Vector3 {
    const { forward } = MathUtility.getBasisVector(this.gameObject);
    return forward.multiplyScalar(-this.brake.getBrakingForce());
  }

  renderSlip(slipping: boolean) {
    if (!this.wheelModel) return;

    this.wheelModel.material = slipping
      ? Wheel.slippingMaterial
      : this.steerable
      ? Wheel.steerWheelMaterial
      : Wheel.driveWheelMaterial;
  }

  tick(dt: number, inputs: Map<InputType, Input>) {
    this.brake.tick(dt, inputs);
  }
}
