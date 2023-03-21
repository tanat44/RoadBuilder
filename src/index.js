import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { buildCurveMenu, buildMainMenu, setupGui } from "./gui";
import { setup } from "./setup";

let camera, scene, renderer;
const splineHelperObjects = [];
let splinePointsLength = 4;
const positions = [];
const point = new THREE.Vector3();
const objects = [];
const raycaster = new THREE.Raycaster();
let cubeGeo, cubeMaterial, cubeMaterialSelected, plane, lineMaterial;
const pointer = new THREE.Vector2();
const onUpPosition = new THREE.Vector2();
const onDownPosition = new THREE.Vector2();

let selectedCube = [];

const geometry = new THREE.BoxGeometry(20, 20, 20);
let transformControl;

const ARC_SEGMENTS = 200;

const splines = {};

const params = {
  uniform: true,
  tension: 0.5,
  centripetal: true,
  chordal: true,
  addPoint: addPoint,
  removePoint: removePoint,
  exportSpline: exportSpline,
};

init();

function init() {
  const result = setup();
  scene = result.scene;
  camera = result.camera;

  // cubes
  cubeGeo = new THREE.BoxGeometry(50, 50, 50);
  cubeMaterial = new THREE.MeshLambertMaterial({
    color: 0xfeb74c,
    map: new THREE.TextureLoader().load("public/square-outline-textured.png"),
  });
  cubeMaterialSelected = cubeMaterial.clone();
  cubeMaterialSelected.color.setHex("0xff0000");

  const planeGeometry = new THREE.PlaneGeometry(2000, 2000);
  planeGeometry.rotateX(-Math.PI / 2);
  const planeMaterial = new THREE.ShadowMaterial({
    color: 0x000000,
    opacity: 0.2,
  });

  plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.position.y = -200;
  plane.receiveShadow = true;
  objects.push(plane);
  scene.add(plane);

  const helper = new THREE.GridHelper(2000, 100);
  helper.position.y = -199;
  helper.material.opacity = 0.25;
  helper.material.transparent = true;
  scene.add(helper);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  setupGui(render);
  buildCurveMenu(params, splines, updateSplineOutline);
  buildMainMenu();

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.damping = 0.2;
  controls.addEventListener("change", render);

  transformControl = new TransformControls(camera, renderer.domElement);
  transformControl.addEventListener("change", render);
  transformControl.addEventListener("dragging-changed", function (event) {
    controls.enabled = !event.value;
  });
  scene.add(transformControl);

  transformControl.addEventListener("objectChange", function () {
    updateSplineOutline();
  });

  document.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("pointerup", onPointerUp);
  document.addEventListener("pointermove", onPointerMove);
  window.addEventListener("resize", onWindowResize);

  /*******
   * Curves
   *********/

  for (let i = 0; i < splinePointsLength; i++) {
    addSplineObject(positions[i]);
  }

  positions.length = 0;

  for (let i = 0; i < splinePointsLength; i++) {
    positions.push(splineHelperObjects[i].position);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(ARC_SEGMENTS * 3), 3)
  );

  lineMaterial = new THREE.LineBasicMaterial({
    color: 0x0000ff,
    opacity: 0.35,
  });

  let curve = new THREE.CatmullRomCurve3(positions);
  curve.curveType = "catmullrom";
  curve.mesh = new THREE.Line(
    geometry.clone(),
    new THREE.LineBasicMaterial({
      color: 0xff0000,
      opacity: 0.35,
    })
  );
  curve.mesh.castShadow = true;
  splines.uniform = curve;

  curve = new THREE.CatmullRomCurve3(positions);
  curve.curveType = "centripetal";
  curve.mesh = new THREE.Line(
    geometry.clone(),
    new THREE.LineBasicMaterial({
      color: 0x00ff00,
      opacity: 0.35,
    })
  );
  curve.mesh.castShadow = true;
  splines.centripetal = curve;

  curve = new THREE.CatmullRomCurve3(positions);
  curve.curveType = "chordal";
  curve.mesh = new THREE.Line(
    geometry.clone(),
    new THREE.LineBasicMaterial({
      color: 0x0000ff,
      opacity: 0.35,
    })
  );
  curve.mesh.castShadow = true;
  splines.chordal = curve;

  for (const k in splines) {
    const spline = splines[k];
    scene.add(spline.mesh);
  }

  load([
    new THREE.Vector3(
      289.76843686945404,
      452.51481137238443,
      56.10018915737797
    ),
    new THREE.Vector3(
      -53.56300074753207,
      171.49711742836848,
      -14.495472686253045
    ),
    new THREE.Vector3(
      -91.40118730204415,
      176.4306956436485,
      -6.958271935582161
    ),
    new THREE.Vector3(-383.785318791128, 491.1365363371675, 47.869296953772746),
  ]);

  render();
}

function addSplineObject(position) {
  const material = new THREE.MeshLambertMaterial({
    color: Math.random() * 0xffffff,
  });
  const object = new THREE.Mesh(geometry, material);

  if (position) {
    object.position.copy(position);
  } else {
    object.position.x = Math.random() * 1000 - 500;
    object.position.y = Math.random() * 600;
    object.position.z = Math.random() * 800 - 400;
  }

  object.castShadow = true;
  object.receiveShadow = true;
  scene.add(object);
  splineHelperObjects.push(object);
  return object;
}

function addPoint() {
  splinePointsLength++;

  positions.push(addSplineObject().position);

  updateSplineOutline();

  render();
}

function removePoint() {
  if (splinePointsLength <= 4) {
    return;
  }

  const point = splineHelperObjects.pop();
  splinePointsLength--;
  positions.pop();

  if (transformControl.object === point) transformControl.detach();
  scene.remove(point);

  updateSplineOutline();

  render();
}

function updateSplineOutline() {
  for (const k in splines) {
    const spline = splines[k];

    const splineMesh = spline.mesh;
    const position = splineMesh.geometry.attributes.position;

    for (let i = 0; i < ARC_SEGMENTS; i++) {
      const t = i / (ARC_SEGMENTS - 1);
      spline.getPoint(t, point);
      position.setXYZ(i, point.x, point.y, point.z);
    }

    position.needsUpdate = true;
  }
}

function exportSpline() {
  const strplace = [];

  for (let i = 0; i < splinePointsLength; i++) {
    const p = splineHelperObjects[i].position;
    strplace.push(`new THREE.Vector3(${p.x}, ${p.y}, ${p.z})`);
  }

  console.log(strplace.join(",\n"));
  const code = "[" + strplace.join(",\n\t") + "]";
  prompt("copy and paste code", code);
}

function load(new_positions) {
  while (new_positions.length > positions.length) {
    addPoint();
  }

  while (new_positions.length < positions.length) {
    removePoint();
  }

  for (let i = 0; i < positions.length; i++) {
    positions[i].copy(new_positions[i]);
  }

  updateSplineOutline();
}

function render() {
  splines.uniform.mesh.visible = params.uniform;
  splines.centripetal.mesh.visible = params.centripetal;
  splines.chordal.mesh.visible = params.chordal;
  renderer.render(scene, camera);
}

function onPointerDown(event) {
  onDownPosition.x = event.clientX;
  onDownPosition.y = event.clientY;

  pointer.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(objects, false);

  if (intersects.length > 0) {
    const intersect = intersects[0];

    if (intersect.object !== plane) {
      if (selectedCube.length === 0) {
        intersect.object.material = cubeMaterialSelected;
      } else {
        selectedCube[0].material = cubeMaterial;
      }
      selectedCube.push(intersect.object);
    } else {
      const voxel = new THREE.Mesh(cubeGeo, cubeMaterial);
      voxel.position.copy(intersect.point).add(intersect.face.normal);
      voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
      scene.add(voxel);
      objects.push(voxel);
    }

    if (selectedCube.length === 2) {
      const points = [];
      points.push(selectedCube[0].position);
      points.push(selectedCube[1].position);

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, lineMaterial);
      scene.add(line);
      selectedCube = [];
    }

    render();
  }
}

function onPointerUp(event) {
  onUpPosition.x = event.clientX;
  onUpPosition.y = event.clientY;

  if (onDownPosition.distanceTo(onUpPosition) === 0) transformControl.detach();
}

function onPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(splineHelperObjects, false);

  if (intersects.length > 0) {
    const object = intersects[0].object;

    if (object !== transformControl.object) {
      transformControl.attach(object);
    }
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}
