// @ts-ignore
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// @ts-ignore
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { PathEngine } from "./PathEngine";
import { ToolState } from "./Tools/ToolState";
import { MouseHandler } from "./MouseHandler";
import {
  Object3D,
  PerspectiveCamera,
  Raycaster,
  Scene,
  WebGLRenderer,
} from "three";
import * as THREE from "three";
import { Assets } from "./Assets";
import { Ui } from "./Ui";
import { Layout, MapSaveData } from "./Layout/Layout";
import { STORAGE_SAVE_KEY } from "./Const";
import { Vehicle } from "./VehicleEmulator/Vehicle";
import {IController} from "./Input/IController";
import {KeyboardController} from "./Input/controls/KeyboardController";
import {GamePadController} from "./Input/controls/GamePadController";
import {ControlsManager} from "./Input";

export class Manager {
  // Data classes
  toolState: ToolState;
  pathEngine: PathEngine;
  mouseHandler: MouseHandler;
  assets: Assets;
  objects: any[];
  map: Layout;
  static instance: Manager;
  vehicle: Vehicle;

  // Threejs
  ui: Ui;
  scene: Scene;
  camera: PerspectiveCamera;
  raycaster: Raycaster;
  renderer: WebGLRenderer;
  transformControl: TransformControls;
  orbitControl: OrbitControls;

  // animation loop
  clock: THREE.Clock;
  updatableObjects: any[];

  private controls: ControlsManager;

  constructor() {
    Manager.instance = this;

    this.objects = [];
    this.raycaster = new THREE.Raycaster();
    this.setupScene();
    this.setupLighting();
    this.setupOrbitControl();
    this.setupTransformControl();

    this.toolState = new ToolState();
    this.pathEngine = new PathEngine();

    // "Kontroler gier zgodny z HID (STANDARD GAMEPAD Vendor: 045e Product: 0b13)"
    // Keyboard
    this.controls = new ControlsManager("Kontroler gier zgodny z HID (STANDARD GAMEPAD Vendor: 045e Product: 0b13)")
    this.assets = new Assets(this);
    // this.ui = new Ui(this);
    this.map = new Layout(this);

    this.vehicle = new Vehicle();
    this.updatableObjects = [];
    this.updatableObjects.push(this.vehicle);

    this.render();
  }

  setupLighting() {
    this.scene.add(new THREE.AmbientLight(0xf0f0f0));
    const light = new THREE.SpotLight(0xffffff, 1.5);
    light.position.set(0, 1500, 200);
    light.angle = Math.PI * 0.2;
    light.castShadow = true;
    light.shadow.camera.near = 200;
    light.shadow.camera.far = 2000;
    light.shadow.bias = -0.000222;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    this.scene.add(light);
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    this.camera.position.set(0, 250, 1000);
    this.scene.add(this.camera);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.clock = new THREE.Clock();
    this.renderer.setAnimationLoop(() => this.tick());

    const container = document.getElementById("container");
    container.appendChild(this.renderer.domElement);

    window.addEventListener("resize", () => this.onWindowResize(this));
  }

  tick() {
    const dt = Manager.instance.clock.getDelta();
    this.updatableObjects.map((obj) => obj.tick(dt, this.controls.currentInputs));
    this.render();
  }

  setupTransformControl() {
    this.transformControl = new TransformControls(
      this.camera,
      this.renderer.domElement
    );
    this.transformControl.showY = false;
    this.transformControl.addEventListener("change", () => this.render());
    this.transformControl.addEventListener("dragging-changed", (event: any) => {
      Manager.instance.orbitControl.enabled = !event.value;
    });
    const _manager = this;
    this.transformControl.addEventListener("objectChange", () => {
      const targetObj = _manager.transformControl.object;
      const node = _manager.map.findNodeGameObject(targetObj);
      if (node) {
        _manager.map.recalculateEdge(node);
        _manager.render();
      }
    });
    this.scene.add(this.transformControl);
  }

  setupOrbitControl() {
    this.orbitControl = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.orbitControl.damping = 0.2;
    this.orbitControl.addEventListener("change", () => this.render());
  }

  removeObject(obj: Object3D) {
    const index = this.objects.indexOf(obj);
    if (index > -1) {
      this.objects.splice(index, 1);
      this.scene.remove(obj);
    }
  }

  resetScene() {
    this.objects.map((obj) => this.scene.remove(obj));
    this.objects = [];
  }

  save() {
    localStorage.setItem(
      STORAGE_SAVE_KEY,
      JSON.stringify(this.map.getSaveData())
    );
  }

  load() {
    const data = localStorage.getItem(STORAGE_SAVE_KEY);
    this.map = new Layout(this);
    this.map.load(JSON.parse(data) as MapSaveData);
    this.render();
  }

  addGameObjectToScene(gameObject: Object3D) {
    this.scene.add(gameObject);
    this.objects.push(gameObject);
    this.render();
  }

  onWindowResize(manager: Manager) {
    manager.camera.aspect = window.innerWidth / window.innerHeight;
    manager.camera.updateProjectionMatrix();
    manager.renderer.setSize(window.innerWidth, window.innerHeight);
    manager.render();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
