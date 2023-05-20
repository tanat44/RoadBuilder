import { IController, Input, InputType } from "./IController";
import { GamePadController } from "./controls/GamePadController";
import { KeyboardController } from "./controls/KeyboardController";
import { ControllerInfo, ControllerType, Products, Vendors } from "./types";


export class ControlsManager {
    private readonly onGamePadConnected: (e: GamepadEvent) => void;
    private readonly onGamePadDisconnected: (e: GamepadEvent) => void;
    private currentControls: IController

    get currentInputs(): Map<InputType, Input> {
        return this.currentControls?.currentInputs ?? new Map<InputType, Input>()
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
        }

        window.addEventListener("gamepadconnected", this.onGamePadConnected);
        window.addEventListener("gamepaddisconnected", this.onGamePadDisconnected);
    }

    dispose(): void {
        this.currentControls.dispose()
    }

    private getControllerById(id?: string)
    {
        const controllerInfo = this.parseControllerId(id)

        if (controllerInfo.type === ControllerType.Keyboard || controllerInfo.type === ControllerType.Unknown) {
            return new KeyboardController()
        }

        if (controllerInfo.type === ControllerType.GamePad) {
            return new GamePadController(id)
        }

        if (controllerInfo.type === ControllerType.Wheel) {
            // TODO add support for wheels
        }
    }

    private parseControllerId(id: string): ControllerInfo {
        const vendorResults = id.match(/(STANDARD GAMEPAD) (Vendor: [a-z0-9]+) (Product: [a-z0-9]+)/i)

        if (!vendorResults) {
            return {
                id,
                type: ControllerType.Unknown,
                product: Products.Unknown,
                vendor: Vendors.Unknown
            }
        }


        const productId = vendorResults.at(3) && vendorResults.at(3).split(":").at(1).trim();
        const vendorId = vendorResults.at(2) && vendorResults.at(2).split(":").at(1).trim();
        const product = Object.values(Products).includes(productId as any) ? productId as Products : Products.Unknown;
        const vendor = Object.values(Vendors).includes(vendorId as any) ? vendorId as Vendors : Vendors.Unknown;
        const gamepad = !!vendorResults[1] || product === Products.XboxOneXController

        return {
            id,
            product,
            vendor,
            type: gamepad ? ControllerType.GamePad : ControllerType.Unknown
        }
    }
}
