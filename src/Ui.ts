import { Manager } from "./Manager";
import { GUI } from "dat.gui";
import { PathEngine } from "./PathEngine";
import { Tools, ToolState } from "./Tools/ToolState";

export class Ui {

  manager: Manager;
  gui: GUI = new GUI();

  constructor(manager: Manager) {
    this.manager = manager;
    this.buildMainMenu(manager.toolState, manager.pathEngine);
    this.buildExampleMenu();
    // buildCurveMenu(params, splines, updateSplineOutline);
  }

  buildCurveMenu(params: any, splines: any, updateSplineOutline: any) {
    if (!this.gui) return;
    const curveFolder = this.gui.addFolder("Curve");
    curveFolder.add(params, "uniform").onChange(this.manager.render);
    curveFolder
      .add(params, "tension", 0, 1)
      .step(0.01)
      .onChange(function (value) {
        splines.uniform.tension = value;
        updateSplineOutline();
        this.manager.render();
      });
    curveFolder.add(params, "centripetal").onChange(this.manager.render);
    curveFolder.add(params, "chordal").onChange(this.manager.render);
    curveFolder.add(params, "addPoint");
    curveFolder.add(params, "removePoint");
    curveFolder.add(params, "exportSpline");
  }

  buildMainMenu(toolState: ToolState, pathEngine: PathEngine) {
    if (!this.gui) return;
    const mainMenu = this.gui.addFolder("Main");

    let obj = {
      CurrentTool: toolState.getCurrentToolString(),
    };

    const currentToolText = mainMenu.add(obj, "CurrentTool");
    toolState.onToolChange = () => {
      currentToolText.setValue(toolState.getCurrentToolString());
    };

    const _manager = this.manager

    const handler = {
      None: function () {
        toolState.changeTool(Tools.None);
      },
      Delete: function () {
        toolState.changeTool(Tools.Delete);
      },
      Intersection: function () {
        toolState.changeTool(Tools.Intersection);
      },
      Station: function () {
        toolState.changeTool(Tools.Station);
      },
      Connect: function () {
        toolState.changeTool(Tools.Connect);
      },
      Calculate: function () {
        pathEngine.calculate();
        toolState.changeTool(Tools.None);
      },
      Save: function () {
        _manager.save();
      },
      Load: function () {
        _manager.load();
      },
    };

    mainMenu.add(handler, "None");
    mainMenu.add(handler, "Delete")
    mainMenu.add(handler, "Intersection");
    mainMenu.add(handler, "Station")
    mainMenu.add(handler, "Connect")
    mainMenu.add(handler, "Calculate");
    mainMenu.add(handler, "Save");
    mainMenu.add(handler, "Load");

    mainMenu.open();
  }

  buildExampleMenu() {
    if (!this.gui) return;
    const exampleMenu = this.gui.addFolder("Example");
    var obj: any = {
      message: "Hello World",
      displayOutline: false,

      maxSize: 6.0,
      speed: 5,

      height: 10,
      noiseStrength: 10.2,
      growthSpeed: 0.2,

      type: "three",

      explode: function () {
        alert("Bang!");
      },

      color0: "#ffae23", // CSS string
      color1: [0, 128, 255], // RGB array
      color2: [0, 128, 255, 0.3], // RGB with alpha
      color3: { h: 350, s: 0.9, v: 0.3 }, // Hue, saturation, value
    };

    exampleMenu.add(obj, "message");
    exampleMenu.add(obj, "displayOutline");
    exampleMenu.add(obj, "explode");

    exampleMenu.add(obj, "maxSize").min(-10).max(10).step(0.25);
    exampleMenu.add(obj, "height").step(5); // Increment amount

    // Choose from accepted values
    exampleMenu.add(obj, "type", ["one", "two", "three"]);

    // Choose from named values
    exampleMenu.add(obj, "speed", { Stopped: 0, Slow: 0.1, Fast: 5 });

    var f1 = exampleMenu.addFolder("Colors");
    f1.addColor(obj, "color0");
    f1.addColor(obj, "color1");
    f1.addColor(obj, "color2");
    f1.addColor(obj, "color3");

    var f2 = exampleMenu.addFolder("Another Folder");
    f2.add(obj, "noiseStrength");

    var f3 = f2.addFolder("Nested Folder");
    f3.add(obj, "growthSpeed");

    obj["Button with a long description"] = function () {
      console.log("Button with a long description pressed");
    };
    exampleMenu.add(obj, "Button with a long description");
  }
}
