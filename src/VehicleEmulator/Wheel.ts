import * as THREE from "three";
import { Object3D, Vector3 } from "three";
import { Manager } from "../Manager";
import { DEG2RAD } from "three/src/math/MathUtils";
import { RENDER_SCALE } from "../Const";
import { Torque } from "./Engine";
import { WheelForceRenderObject } from "./WheelForceRenderObject";
import { Brake } from "./Brake";
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
  wheelForceObject: WheelForceRenderObject;

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
  }

  render() {
    const cylinder = new THREE.CylinderGeometry(
      this.radius * RENDER_SCALE,
      this.radius * RENDER_SCALE,
      0.1 * RENDER_SCALE
    );
    const material = new THREE.MeshStandardMaterial();
    material.color.setHex(this.steerable ? 0xff0055 : 0x5500ff);
    material.transparent = true;
    material.opacity = 0.9;
    const model = new THREE.Mesh(cylinder, material);
    model.rotateX(90 * DEG2RAD);
    this.gameObject = new THREE.Group();
    this.gameObject.add(model);
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

  tick(dt: number, lastKeyPress: Set<string>) {
    this.brake.tick(dt, lastKeyPress);
  }
}
