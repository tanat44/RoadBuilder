import * as THREE from "three";
import { Object3D, Vector3 } from "three";
import { Manager } from "../Manager";
import { DEG2RAD } from "three/src/math/MathUtils";
import { RENDER_SCALE } from "../Const";
import { Torque } from "./Engine";

export class Wheel {
  radius: number; // m
  hubCenter: Vector3; // from center of mass
  steeringAngle: number;
  isFrontAxle: boolean;
  mass: number; // kg
  rotationMass: number; // moment of inertia

  // render
  gameObject: Object3D;

  constructor(hubCenter: Vector3, isFrontAxle = false) {
    this.radius = 0.5;
    this.hubCenter = hubCenter;
    this.steeringAngle = 0;
    this.isFrontAxle = isFrontAxle;
    this.mass = 7;
    this.rotationMass = Wheel.momentOfInertia(
      this.mass,
      this.radius,
      this.radius - 0.1 // wheel thickness is 0.1 m
    );

    this.render();
  }

  render() {
    const cylinder = new THREE.CylinderGeometry(
      this.radius * RENDER_SCALE,
      this.radius * RENDER_SCALE,
      0.1 * RENDER_SCALE
    );
    const material = new THREE.MeshStandardMaterial();
    material.color.setHex(this.isFrontAxle ? 0xff0055 : 0x5500ff);
    this.gameObject = new THREE.Mesh(cylinder, material);
    this.gameObject.position.copy(
      this.hubCenter.clone().multiplyScalar(RENDER_SCALE)
    );
    this.setSteeringAngle(this.steeringAngle);

    Manager.instance.addGameObjectToScene(this.gameObject);
  }

  setSteeringAngle(newAngle: number) {
    this.steeringAngle = newAngle;
    this.gameObject.setRotationFromQuaternion(
      this.getRotation(this.steeringAngle)
    );
    Manager.instance.render();
  }

  getRotation(angle: number): THREE.Quaternion {
    const q = new THREE.Quaternion();
    q.setFromEuler(
      new THREE.Euler(90 * DEG2RAD, 0, -this.steeringAngle * DEG2RAD)
    );
    return q;
  }

  getDrivingForceMagnitude(torque: Torque): number {
    return torque / this.radius;
  }

  static momentOfInertia(mass: number, r1: number, r2: number) {
    return mass * (r1 * r1 + r2 * r2);
  }
}
