export default class BaseEngine(){
  this.scene = null;
  this.camera = null;

  this.init(scene, camera) {
    this.scene = scene;
    this.camera = camera;
  }
  this.render();
  
}