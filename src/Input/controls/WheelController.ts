import { IController, Input, InputType } from "../IController";

const WHEEL_DEAD_ZONE = 0;

export class WheelController implements IController {
    get currentInputs(): Map<InputType, Input> {
        return this.inputs;
    }

    private inputs: Map<InputType, Input> = new Map();
    private readonly controllerId: string;
    private readonly interval: NodeJS.Timer;
    private get currentGamepad(): Gamepad {
        // Browser reports two wheels. The last one is the one that reports values.
        const wheels = navigator
            .getGamepads()
            ?.filter(Boolean)
            .filter(gamepad => gamepad.id === this.controllerId);

        return wheels.at(-1);
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
            const [steering] = this.currentGamepad.axes

            if (steering - WHEEL_DEAD_ZONE > 0) {
                this.inputs.set(InputType.Right, {value: steering, name: InputType.Right});

            } else {
                this.inputs.delete(InputType.Right);

            }

            if (steering + WHEEL_DEAD_ZONE < 0) {
                this.inputs.set(InputType.Left, {value: steering, name: InputType.Left});

            } else {
                this.inputs.delete(InputType.Left);
            }
        }
    }
}
