import { Object3D, Group } from "three";
import {
  FORCE_RENDER_SCALE,
  NORMAL_FORCE_RENDER_SCALE,
  RENDER_SCALE,
} from "../Const";
import * as THREE from "three";
import { Manager } from "../Manager";

const Y_OFFSET = 0.5;

export class WheelForceRenderObject {
  allForceObject: Group;
  normalForceObject: Group;
  drivingForceModel: THREE.Mesh;
  drivingForceObject: Group;

  engineForceMaterial: THREE.MeshStandardMaterial;
  brakingForceMaterial: THREE.MeshStandardMaterial;

  constructor(wheelRadius: number) {
    this.render(wheelRadius);
  }

  render(wheelRadius: number) {
    const size = 0.05 * RENDER_SCALE;
    const box = new THREE.BoxGeometry(size, size, size);

    // normal
    const normalForceMaterial = new THREE.MeshStandardMaterial();
    normalForceMaterial.color.setHex(0x616161);
    const normalForceModel = new THREE.Mesh(box, normalForceMaterial);
    normalForceModel.position.copy(new THREE.Vector3(0, size / 2, 0));
    this.normalForceObject = new Group();
    this.normalForceObject.add(normalForceModel);

    // driving
    this.engineForceMaterial = new THREE.MeshStandardMaterial();
    this.engineForceMaterial.color.setHex(0x99ff00);
    this.drivingForceModel = new THREE.Mesh(box, this.engineForceMaterial);
    this.drivingForceModel.position.copy(new THREE.Vector3(size / 2, 0, 0));
    this.drivingForceObject = new Group();
    this.drivingForceObject.add(this.drivingForceModel);

    // all forces
    this.allForceObject = new Group();
    this.allForceObject.add(this.normalForceObject);
    this.allForceObject.add(this.drivingForceObject);
    this.allForceObject.position.copy(
      new THREE.Vector3(0, (wheelRadius + Y_OFFSET) * RENDER_SCALE, 0)
    );
    Manager.instance.addGameObjectToScene(this.allForceObject);
  }

  setParent(parent: Object3D) {
    this.allForceObject.parent = parent;
  }

  updateForce(normalForce: number, drivingForce: number) {
    this.normalForceObject.scale.set(
      1,
      normalForce * NORMAL_FORCE_RENDER_SCALE,
      1
    );

    if (drivingForce < 0)
      this.drivingForceModel.material = this.brakingForceMaterial;
    else this.drivingForceModel.material = this.engineForceMaterial;
    this.drivingForceObject.scale.set(drivingForce * FORCE_RENDER_SCALE, 1, 1);
  }
}
