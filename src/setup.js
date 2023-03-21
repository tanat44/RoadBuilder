import * as THREE from "three";

function setupLighting(scene) {
  scene.add(new THREE.AmbientLight(0xf0f0f0));
  const light = new THREE.SpotLight(0xffffff, 1.5);
  light.position.set(0, 1500, 200);
  light.angle = Math.PI * 0.2;
  light.castShadow = true;
  light.shadow.camera.near = 200;
  light.shadow.camera.far = 2000;
  light.shadow.bias = -0.000222;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  scene.add(light);
}

export function setup() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.set(0, 250, 1000);
  scene.add(camera);

  setupLighting(scene);

  return { scene, camera };
}
