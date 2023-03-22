import * as THREE from "three";
import { BoxGeometry, Material, Mesh, MeshLambertMaterial, Object3D, Vector3 } from "three";
import { Manager } from "./Manager";

export class Assets{

  manager: Manager;
  cubeGeo: BoxGeometry;
  plane: Mesh;

  cubeMaterial: MeshLambertMaterial;
  cubeMaterialSelected: MeshLambertMaterial;
  intersectionMaterial: MeshLambertMaterial;
  stationMaterial: MeshLambertMaterial;
  lineMaterial: Material;

  constructor(manager: Manager){
    this.manager = manager

    // cube
    this.cubeGeo = new THREE.BoxGeometry(50, 50, 50);

    // material
    this.cubeMaterial = new THREE.MeshLambertMaterial({
      color: 0xfeb74c,
      map: new THREE.TextureLoader().load("public/square-outline-textured.png"),
    });
    this.cubeMaterialSelected = this.cubeMaterial.clone();
    this.cubeMaterialSelected.color.setHex("0xff0000" as any);
    this.intersectionMaterial = this.cubeMaterial.clone();
    this.intersectionMaterial.color.setHex("0xaaaaaa" as any);
    this.stationMaterial = this.cubeMaterial.clone();
    this.stationMaterial.color.setHex("0x11ff00" as any);

    const planeGeometry = new THREE.PlaneGeometry(2000, 2000);
    planeGeometry.rotateX(-Math.PI / 2);
    const planeMaterial = new THREE.ShadowMaterial({
      color: 0x000000,
      opacity: 0.2,
    });

    this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.plane.position.y = -200;
    this.plane.receiveShadow = true;
    manager.objects.push(this.plane);
    manager.scene.add(this.plane);

    const helper = new THREE.GridHelper(2000, 100);
    helper.position.y = -199;
    (helper.material as any).opacity = 0.25;
    (helper.material as any).transparent = true;
    manager.scene.add(helper);

    this.lineMaterial = new THREE.LineBasicMaterial({
      color: 0x0000ff,
      opacity: 0.35,
    });
  }

  createCube(pos: Vector3, material: Material): Object3D {
    const gameObject = new THREE.Mesh(this.manager.assets.cubeGeo, material);
    gameObject.position.copy(pos);
    gameObject.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
    this.manager.scene.add(gameObject);
    this.manager.objects.push(gameObject)
    return gameObject
  }
}