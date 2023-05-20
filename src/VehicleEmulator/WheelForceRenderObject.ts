import { Object3D, Group, Vector3 } from "three";
import {
  CONTACT_FORCE_COEFFICIENT,
  CONTACT_FORCE_RENDER_SCALE,
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
  contactForceObject: Group; // tire contact force from slip angle

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
    this.engineForceMaterial.color.setHex(0x22ff00);
    this.brakingForceMaterial = new THREE.MeshStandardMaterial();
    this.brakingForceMaterial.color.setHex(0xff2211);
    this.drivingForceModel = new THREE.Mesh(box, this.engineForceMaterial);
    this.drivingForceModel.position.copy(new THREE.Vector3(size / 2, 0, 0));
    this.drivingForceObject = new Group();
    this.drivingForceObject.add(this.drivingForceModel);

    // contact
    const contactForceMaterial = new THREE.MeshStandardMaterial();
    contactForceMaterial.color.setHex(0x1400ad);
    const contactForceModel = new THREE.Mesh(box, contactForceMaterial);
    contactForceModel.position.copy(new THREE.Vector3(0, 0, size / 2));
    this.contactForceObject = new Group();
    this.contactForceObject.add(contactForceModel);

    // all forces
    this.allForceObject = new Group();
    this.allForceObject.add(this.normalForceObject);
    this.allForceObject.add(this.drivingForceObject);
    this.allForceObject.add(this.contactForceObject);
    this.allForceObject.position.copy(
      new THREE.Vector3(0, (wheelRadius + Y_OFFSET) * RENDER_SCALE, 0)
    );
    Manager.instance.addGameObjectToScene(this.allForceObject);
  }

  setParent(parent: Object3D) {
    this.allForceObject.parent = parent;
  }

  updateNormalForce(normalForce: number) {
    this.normalForceObject.scale.set(
      1,
      normalForce * NORMAL_FORCE_RENDER_SCALE,
      1
    );
  }

  updateDrivingForce(drivingForce: number) {
    if (drivingForce < 0)
      this.drivingForceModel.material = this.brakingForceMaterial;
    else this.drivingForceModel.material = this.engineForceMaterial;
    this.drivingForceObject.scale.set(drivingForce * FORCE_RENDER_SCALE, 1, 1);
  }

  updateContactForce(contactForce: number) {
    this.contactForceObject.scale.set(
      1,
      1,
      (contactForce / CONTACT_FORCE_COEFFICIENT) * CONTACT_FORCE_RENDER_SCALE
    );
  }
}
