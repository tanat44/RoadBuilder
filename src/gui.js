import { GUI } from "dat.gui";

let render = null;
let gui = null;

export function buildCurveMenu(params, splines, updateSplineOutline) {
  const curveFolder = gui.addFolder("Curve");
  curveFolder.add(params, "uniform").onChange(render);
  curveFolder
    .add(params, "tension", 0, 1)
    .step(0.01)
    .onChange(function (value) {
      splines.uniform.tension = value;
      updateSplineOutline();
      render();
    });
  curveFolder.add(params, "centripetal").onChange(render);
  curveFolder.add(params, "chordal").onChange(render);
  curveFolder.add(params, "addPoint");
  curveFolder.add(params, "removePoint");
  curveFolder.add(params, "exportSpline");
}

export function buildMainMenu() {
  const mainMenu = gui.addFolder("Main");
  var obj = {
    add: function () {
      alert("clicked!");
    },
  };
  mainMenu.add(obj, "add").name("Click Me");
  mainMenu.open();
}

export function setupGui(_render) {
  render = _render;
  gui = new GUI();
}
