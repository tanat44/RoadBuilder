import { Object3D, Vector3 } from "three";
import * as THREE from "three";
import { Manager } from "../Manager";
import { DEG2RAD } from "three/src/math/MathUtils";

export class Vehicle {
  // physics
  state: VehicleState;

  // physics constant
  centerOfMass: Vector3;
  wheelFL: Wheel;
  wheelFR: Wheel;
  wheelRL: Wheel;
  wheelRR: Wheel;

  // rendering
  groundProjectionGameObject: Object3D;

  constructor() {
    this.state = new VehicleState();
    this.centerOfMass = new Vector3(0, 50, 0);
    this.wheelFL = new Wheel(new Vector3(200, 0, -100), true);
    this.wheelFR = new Wheel(new Vector3(200, 0, 100), true);
    this.wheelRL = new Wheel(new Vector3(-200, 0, -100));
    this.wheelRL = new Wheel(new Vector3(-200, 0, 100));

    this.drawGameObject();
  }

  drawGameObject() {
    this.drawGroundProjection();
  }

  drawGroundProjection() {
    const width = new Vector3(0, 0, 1).dot(
      this.wheelFL.hubCenter.clone().sub(this.wheelFR.hubCenter)
    );
    const length = new Vector3(1, 0, 0).dot(
      this.wheelFL.hubCenter.clone().sub(this.wheelRL.hubCenter)
    );
    const box = new THREE.BoxGeometry(length, 1, width);
    const material = new THREE.MeshStandardMaterial();
    material.color.setHex(0xdddddd);
    this.groundProjectionGameObject = new THREE.Mesh(box, material);
    this.groundProjectionGameObject.position.copy(this.centerOfMass);

    var axesHelper = new THREE.AxesHelper(400);
    Manager.instance.addGameObjectToScene(axesHelper);
    axesHelper.add(this.groundProjectionGameObject);
    Manager.instance.addGameObjectToScene(this.groundProjectionGameObject);
  }
}

class Wheel {
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

class VehicleState {
  position: Vector3;
  velocity: Vector3;
  acceleration: Vector3;
  forward: Vector3;

  constructor() {
    this.position = new Vector3();
    this.velocity = new Vector3();
    this.acceleration = new Vector3();
    this.forward = new Vector3(1, 0, 0);
  }
}
