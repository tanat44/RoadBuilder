import { IController, Input, InputType } from "../IController";

const STICK_DEAD_ZONE = 0.1;

export class GamePadController implements IController {
    get currentInputs(): Map<InputType, Input> {
        return this.inputs;
    }

    private inputs: Map<InputType, Input> = new Map();
    private readonly controllerId: string;
    private readonly interval: NodeJS.Timer;
    private get currentGamepad(): Gamepad {
        return navigator
            .getGamepads()
            ?.filter(Boolean)
            .find(gamepad => gamepad.id === this.controllerId);
    }

    constructor(controllerId: string) {
        this.controllerId = controllerId;
        this.interval = setInterval(() => this.poolGamepad(), 200)
    }

    dispose() {
        clearInterval(this.interval)
    }

    private poolGamepad() {
        if (this.currentGamepad) {
            const [
                leftStickHorizontal,
                leftStickVertical,
                rightStickHorizontal,
                rightStickVertical
            ] = this.currentGamepad.axes

            if (leftStickHorizontal - STICK_DEAD_ZONE > 0) {
                this.inputs.set(InputType.Right, {value: leftStickHorizontal, name: InputType.Right});
            } else {
                this.inputs.delete(InputType.Right);
            }
            if (leftStickHorizontal + STICK_DEAD_ZONE < 0) {
                this.inputs.set(InputType.Left, {value: leftStickHorizontal, name: InputType.Left});
            } else {
                this.inputs.delete(InputType.Left);
            }
            if (leftStickVertical - STICK_DEAD_ZONE > 0) {
                this.inputs.set(InputType.Down, {value: leftStickVertical, name: InputType.Down});
            } else {
                this.inputs.delete(InputType.Down);
            }
            if (leftStickVertical + STICK_DEAD_ZONE < 0) {
                this.inputs.set(InputType.Up, {value: leftStickVertical, name: InputType.Up});
            } else {
                this.inputs.delete(InputType.Up);
            }
        }
    }
}
