import { Manager } from "./Manager";
import { GUI } from "dat.gui";
import { PathEngine } from "./PathEngine";
import { Tools, ToolState } from "./Tools/ToolState";

export class Ui {
  manager: Manager;
  gui: GUI = new GUI();
  infoText: any;
  objectNameText: any;

  constructor(manager: Manager) {
    this.manager = manager;
    this.buildInfoMenu();
    this.buildToolbar();
    this.buildDebugMenu();
    // this.buildExampleMenu();
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

  buildToolbar() {
    if (!this.gui) return;
    const mainMenu = this.gui.addFolder("Toolbar");
    const _manager = this.manager;

    const handler = {
      Select: function () {
        _manager.toolState.changeTool(Tools.Select);
      },
      Delete: function () {
        _manager.toolState.changeTool(Tools.Delete);
      },
      Intersection: function () {
        _manager.toolState.changeTool(Tools.Intersection);
      },
      Station: function () {
        _manager.toolState.changeTool(Tools.Station);
      },
      Connection: function () {
        _manager.toolState.changeTool(Tools.Connection);
      },
      Save: function () {
        _manager.save();
      },
      Load: function () {
        _manager.load();
      },
      CalculateSegment: function () {
        _manager.map.calculateSegment();
      },
    };

    mainMenu.add(handler, "Select");
    mainMenu.add(handler, "Delete");
    mainMenu.add(handler, "Intersection");
    mainMenu.add(handler, "Station");
    mainMenu.add(handler, "Connection");
    mainMenu.add(handler, "Save");
    mainMenu.add(handler, "Load");
    mainMenu.add(handler, "CalculateSegment").name("Calculate segment");

    mainMenu.open();
  }

  buildInfoMenu() {
    const infoMenu = this.gui.addFolder("Information");
    let obj = {
      CurrentTool: this.manager.toolState.getCurrentToolString(),
      Info: "",
      ObjectName: "",
    };
    const currentToolText = infoMenu.add(obj, "CurrentTool");
    this.manager.toolState.subscribeToolChange(() => {
      currentToolText.setValue(this.manager.toolState.getCurrentToolString());
    });
    this.infoText = infoMenu.add(obj, "Info");
    this.objectNameText = infoMenu.add(obj, "ObjectName");

    infoMenu.open();
  }

  buildDebugMenu() {
    const debugMenu = this.gui.addFolder("Debug");
    const _manager = this.manager;
    const handler = {
      "Print nodes": function () {
        console.log(_manager.map.nodes);
      },
      "Print edges": function () {
        console.log(_manager.map.edges);
      },
    };

    debugMenu.add(handler, "Print nodes");
    debugMenu.add(handler, "Print edges");
    debugMenu.open();
  }

  setInfoText(text: string) {
    this.infoText.setValue(text);
  }

  setObjectNameText(name: string) {
    this.objectNameText.setValue(name);
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
