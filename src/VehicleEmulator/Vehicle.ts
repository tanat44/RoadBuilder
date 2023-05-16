import { Object3D, Vector3 } from "three";
import * as THREE from "three";
import { Manager } from "../Manager";
import { DEG2RAD } from "three/src/math/MathUtils";
import { VehicleState } from "./VehicleState";
import { Wheel } from "./Wheel";

export class Vehicle {
  // physics
  previousState: VehicleState;
  state: VehicleState;

  // physics constant
  centerOfMass: Vector3;
  wheelFL: Wheel;
  wheelFR: Wheel;
  wheelRL: Wheel;
  wheelRR: Wheel;

  // rendering
  gameObject: Object3D;

  constructor() {
    this.previousState = new VehicleState();
    this.state = new VehicleState();
    this.centerOfMass = new Vector3(0, 50, 0);
    this.wheelFL = new Wheel(new Vector3(200, 0, -100), true);
    this.wheelFR = new Wheel(new Vector3(200, 0, 100), true);
    this.wheelRL = new Wheel(new Vector3(-200, 0, -100));
    this.wheelRR = new Wheel(new Vector3(-200, 0, 100));

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
    this.gameObject = new THREE.Mesh(box, material);
    this.gameObject.position.copy(this.centerOfMass);
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
    this.previousState.copyState(this.state);

    // integrate a, v
    this.state.velocity.add(this.state.acceleration.clone().multiplyScalar(dt));
    this.state.position.add(this.state.velocity.clone().multiplyScalar(dt));
    this.gameObject.position.copy(this.state.position);

    this.state.updateDirection(this.gameObject.matrixWorld);
  }
}
