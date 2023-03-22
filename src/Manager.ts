// @ts-ignore
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// @ts-ignore
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { PathEngine } from "./PathEngine";
import { ToolState } from "./Tools/ToolState";
import { MouseHandler } from "./MouseHandler";
import { Camera, Raycaster, Renderer, Scene, WebGLRenderer } from "three";
import * as THREE from "three";
import { Assets } from "./Assets";
import { Ui } from "./Ui";
import { Map, MapSaveData } from "./Map/Map";
import { STORAGE_SAVE_KEY } from "./Const";

export class Manager {
  // Data classes
  toolState: ToolState;
  pathEngine: PathEngine;
  mouseHandler: MouseHandler;
  assets: Assets;
  objects: any[];
  map: Map;

  // Threejs
  ui: Ui;
  scene: Scene;
  camera: Camera;
  raycaster: Raycaster;
  render: () => void;
  renderer: WebGLRenderer;
  transformControl: TransformControls;
  orbitControl: OrbitControls;

  constructor() {
    this.objects = [];
    this.raycaster = new THREE.Raycaster();
    this.setupScene();
    this.setupLighting();
    this.setupOrbitControl();
    this.setupTransformControl();

    this.toolState = new ToolState();
    this.pathEngine = new PathEngine();
    this.mouseHandler = new MouseHandler(this);
    this.assets = new Assets(this);
    this.ui = new Ui(this);
    this.map = new Map(this);
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
    document.body.appendChild(this.renderer.domElement);
  }

  setupTransformControl() {
    this.transformControl = new TransformControls(
      this.camera,
      this.renderer.domElement
    );
    this.transformControl.addEventListener("change", this.render);
    this.transformControl.addEventListener(
      "dragging-changed",
      function (event: any) {
        this.orbitControl.enabled = !event.value;
      }
    );
    this.scene.add(this.transformControl);
  }

  setupOrbitControl() {
    this.orbitControl = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.orbitControl.damping = 0.2;
  }

  removeObject(obj: any) {
    const index = this.objects.indexOf(obj);
    if (index > -1) {
      this.objects.splice(index, 1);
      this.scene.remove(obj)
    }
  }

  resetScene(){
    this.objects.map(obj => this.scene.remove(obj))
    this.objects = []
  }

  save(){
    localStorage.setItem(STORAGE_SAVE_KEY, JSON.stringify(this.map.getSaveData()))
  }

  load(){
    const data = localStorage.getItem(STORAGE_SAVE_KEY)
    this.map = new Map(this)
    this.map.load(JSON.parse(data) as MapSaveData)
    this.render()
  }
}
