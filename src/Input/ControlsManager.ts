import { IController, Input, InputType } from "./IController";
import { GamePadController } from "./controls/GamePadController";
import { KeyboardController } from "./controls/KeyboardController";
import {
  ControllerInfo,
  ControllerType,
  FanatecProducts,
  MicrosoftProducts,
  Vendors,
} from "./types";
import { WheelController } from "./controls/WheelController";

export class ControlsManager {
  private readonly onGamePadConnected: (e: GamepadEvent) => void;
  private readonly onGamePadDisconnected: (e: GamepadEvent) => void;
  private currentControls: IController;

  get currentInputs(): Map<InputType, Input> {
    return this.currentControls?.currentInputs ?? new Map<InputType, Input>();
  }

  constructor(controllerId: string) {
    this.currentControls = this.getControllerById(controllerId);

    this.onGamePadConnected = (e: GamepadEvent) => {
      console.log(
        "Gamepad connected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index,
        e.gamepad.id,
        e.gamepad.buttons.length,
        e.gamepad.axes.length
      );
    };

    this.onGamePadDisconnected = (e: GamepadEvent) => {
      console.log(
        "Gamepad disconnected from index %d: %s",
        e.gamepad.index,
        e.gamepad.id
      );
    };

    window.addEventListener("gamepadconnected", this.onGamePadConnected);
    window.addEventListener("gamepaddisconnected", this.onGamePadDisconnected);
  }

  dispose(): void {
    this.currentControls.dispose();
  }

  interpolateInput(dt: number): void {
    this.currentControls?.interpolateInput(dt);
  }

  private getControllerById(id?: string) {
    const controllerInfo = this.parseControllerId(id);

    if (
      controllerInfo.type === ControllerType.Keyboard ||
      controllerInfo.type === ControllerType.Unknown
    ) {
      return new KeyboardController();
    }

    if (controllerInfo.type === ControllerType.GamePad) {
      return new GamePadController(id);
    }

    if (controllerInfo.type === ControllerType.Wheel) {
      return new WheelController(id);
    }
  }

  private parseControllerId(id: string): ControllerInfo {
    id = id.toLowerCase();
    const vendorId = id
      .match(/vendor: [a-z0-9]+/i)
      ?.at(0)
      .split(":")
      .at(1)
      .trim();
    const productId = id
      .match(/product: [a-z0-9]+/i)
      ?.at(0)
      .split(":")
      .at(1)
      .trim();
    const vendor = Object.values(Vendors).includes(vendorId as any)
      ? (vendorId as Vendors)
      : Vendors.Unknown;
    let product: string = null;
    let type = ControllerType.Unknown;

    if (vendor === Vendors.Microsoft) {
      product = Object.values(MicrosoftProducts).includes(productId as any)
        ? (productId as MicrosoftProducts)
        : null;
      type =
        product === MicrosoftProducts.XboxOneXController
          ? ControllerType.GamePad
          : type;
    } else if (vendor === Vendors.Fanatec) {
      product = Object.values(FanatecProducts).includes(productId as any)
        ? (productId as FanatecProducts)
        : null;
      type =
        product === FanatecProducts.PodiumWheelBaseDD1
          ? ControllerType.Wheel
          : type;
    } else {
      if (
        id.includes("standard gamepad") ||
        id.includes("xbox 360 controller")
      ) {
        type = ControllerType.GamePad;
      } else if (id.includes("wheel")) {
        type = ControllerType.Wheel;
      }
    }

    return {
      id,
      product,
      vendor,
      type,
    };
  }
}
