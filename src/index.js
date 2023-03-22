import * as THREE from "three";
import { Manager } from "./Manager";

const splineHelperObjects = [];
let splinePointsLength = 4;
const positions = [];
const point = new THREE.Vector3();
const manager = new Manager();
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
  manager.render = render;

  // Controls
  manager.orbitControl.addEventListener("change", render);
  manager.transformControl.addEventListener("objectChange", function () {
    updateSplineOutline();
  });

  window.addEventListener("resize", onWindowResize);
  render();
}

function initCurve() {
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
    manager.scene.add(spline.mesh);
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
  manager.scene.add(object);
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
  // splines.uniform.mesh.visible = params.uniform;
  // splines.centripetal.mesh.visible = params.centripetal;
  // splines.chordal.mesh.visible = params.chordal;
  manager.renderer.render(manager.scene, manager.camera);
}

function onWindowResize() {
  manager.camera.aspect = window.innerWidth / window.innerHeight;
  manager.camera.updateProjectionMatrix();

  manager.renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}
