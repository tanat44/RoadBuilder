import {IController, Input, InputType} from "./IController";
import {GamePadController} from "./controls/GamePadController";
import {KeyboardController} from "./controls/KeyboardController";
import {
    ControllerInfo,
    ControllerType,
    FanatecProductId,
    FanatecProductName,
    MicrosoftProductId,
    MicrosoftProductName,
    Vendors
} from "./types";
import {WheelController} from "./controls/WheelController";
import {Event, EventHub, SystemEvent} from "../EventHub";


export class ControlsManager {
    // Events
    private readonly onGamePadConnected: (e: GamepadEvent) => void;
    private readonly onGamePadDisconnected: (e: GamepadEvent) => void;
    private readonly onCurrentControllerChanged: (event: SystemEvent) => void;

    private readonly connectedControllers: Map<string, ControllerInfo> = new Map();
    private currentController: IController

    get currentInputs(): Map<InputType, Input> {
        return this.currentController?.currentInputs ?? new Map<InputType, Input>()
    }

    constructor(private readonly hub: EventHub) {
        this.currentController = this.getControllerById('Keyboard');

        this.connectedControllers.set('Keyboard', {
            productName: 'Keyboard',
            type: ControllerType.Keyboard,
            vendorId: Vendors.Unknown,
            productId: null,
            id: 'Keyboard'
        })

        this.emitListUpdatedEvent()

        this.onCurrentControllerChanged = (event: SystemEvent) => {
            this.currentController = this.getControllerById(event.value);
        }

        this.onGamePadConnected = (e: GamepadEvent) => {
            console.log(
                "Gamepad connected at index %d: %s. %d buttons, %d axes.",
                e.gamepad.index,
                e.gamepad.id,
                e.gamepad.buttons.length,
                e.gamepad.axes.length
            );

            this.connectedControllers.set(e.gamepad.id, this.parseControllerId(e.gamepad.id))
            this.emitListUpdatedEvent();
        };

        this.onGamePadDisconnected = (e: GamepadEvent) => {
            console.log(
                "Gamepad disconnected from index %d: %s",
                e.gamepad.index,
                e.gamepad.id
            );

            this.connectedControllers.delete(e.gamepad.id)
            this.emitListUpdatedEvent();
        }

        this.hub.on(Event.SettingsCurrentControllerChanged, this.onCurrentControllerChanged);
        window.addEventListener("gamepadconnected", this.onGamePadConnected);
        window.addEventListener("gamepaddisconnected", this.onGamePadDisconnected);
    }

    dispose(): void {
        this.currentController.dispose()
        this.hub.off(Event.SettingsCurrentControllerChanged);
        window.removeEventListener("gamepadconnected", this.onGamePadConnected);
        window.removeEventListener("gamepaddisconnected", this.onGamePadDisconnected);
    }

    private emitListUpdatedEvent() {
        this.hub.emit(Event.SettingsControllersListUpdated, new SystemEvent(Array.from(this.connectedControllers.values())))
    }

    private getControllerById(id?: string) {
        const controllerInfo = this.parseControllerId(id)

        if (controllerInfo.type === ControllerType.Keyboard || controllerInfo.type === ControllerType.Unknown) {
            return new KeyboardController()
        }

        if (controllerInfo.type === ControllerType.GamePad) {
            return new GamePadController(id)
        }

        if (controllerInfo.type === ControllerType.Wheel) {
            return new WheelController(id)
        }
    }

    private parseControllerId(id: string): ControllerInfo {
        const lowercaseId = id.toLowerCase()
        const vendor = lowercaseId.match(/vendor: [a-z0-9]+/i)?.at(0).split(":").at(1).trim();
        const product = lowercaseId.match(/product: [a-z0-9]+/i)?.at(0).split(":").at(1).trim();
        const vendorId = Object.values(Vendors).includes(vendor as any) ? vendor as Vendors : Vendors.Unknown;
        let productId: string = null
        let productName = id;
        let type= ControllerType.Unknown

        if (vendorId === Vendors.Microsoft) {
            if (Object.values(MicrosoftProductId).includes(product as any)) {
                productId = product as MicrosoftProductId;
                productName = MicrosoftProductName[product as MicrosoftProductId];
            }
            type = product === MicrosoftProductId.XboxOneXController ? ControllerType.GamePad : type
        }
        else if (vendorId === Vendors.Fanatec) {
            if (Object.values(FanatecProductId).includes(product as any)) {
                productId = product as FanatecProductId
                productName = FanatecProductName[product as FanatecProductId]
            }
            type = productId === FanatecProductId.PodiumWheelBaseDD1 ? ControllerType.Wheel : type
        } else {
            if (lowercaseId.includes("standard gamepad") || lowercaseId.includes("xbox 360 controller")) {
                type = ControllerType.GamePad
            } else if (lowercaseId.includes("wheel")) {
                type = ControllerType.Wheel
            }
        }

        return {
            id,
            productId,
            productName,
            vendorId,
            type
        }
    }
}
