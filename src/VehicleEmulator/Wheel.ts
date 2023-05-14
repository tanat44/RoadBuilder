import * as THREE from "three";
import { Object3D, Vector3 } from "three";
import { Manager } from "../Manager";
import { DEG2RAD } from "three/src/math/MathUtils";

export class Wheel {
  radius: number;
  hubCenter: Vector3; // from center of mass
  steeringAngle: number;
  isFrontAxle: boolean;

  // render
  gameObject: Object3D;

  constructor(hubCenter: Vector3, isFrontAxle = false) {
    this.radius = 50;
    this.hubCenter = hubCenter;
    this.steeringAngle = 0;
    this.isFrontAxle = isFrontAxle;

    this.render();
  }

  render() {
    const cylinder = new THREE.CylinderGeometry(50, 50, 5);
    const material = new THREE.MeshStandardMaterial();
    material.color.setHex(this.isFrontAxle ? 0xff0055 : 0x5500ff);
    this.gameObject = new THREE.Mesh(cylinder, material);
    this.gameObject.position.copy(this.hubCenter);
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
}
