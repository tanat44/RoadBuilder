import { IController, Input, InputType } from "../IController";

export class KeyboardController implements IController {

    private inputs: Map<InputType, Input> = new Map();
    private readonly onKeyUp: (e: KeyboardEvent) => void;
    private readonly onKeyDown: (e: KeyboardEvent) => void;

    get currentInputs(): Map<InputType, Input> {
        return this.inputs;
    }

    constructor() {
        this.onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "w" || e.key === "ArrowUp") {
                this.inputs.set(InputType.Up, {value: 1, name: InputType.Up});
            }

            if (e.key === "s" || e.key === "ArrowDown") {
                this.inputs.set(InputType.Down, {value: 1, name: InputType.Down});
            }

            if (e.key === "a" || e.key === "ArrowLeft") {
                this.inputs.set(InputType.Left, {value: 1, name: InputType.Left});
            }

            if (e.key === "d" || e.key === "ArrowRight") {
                this.inputs.set(InputType.Right, {value: 1, name: InputType.Right});
            }
        }

        this.onKeyUp = (e: KeyboardEvent) => {
            if (e.key === "w" || e.key === "ArrowUp") {
                this.inputs.delete(InputType.Up);
            }

            if (e.key === "s" || e.key === "ArrowDown") {
                this.inputs.delete(InputType.Down);
            }

            if (e.key === "a" || e.key === "ArrowLeft") {
                this.inputs.delete(InputType.Left);
            }

            if (e.key === "d" || e.key === "ArrowRight") {
                this.inputs.delete(InputType.Right);
            }
        }

        window.addEventListener('keyup', this.onKeyUp);
        window.addEventListener('keydown', this.onKeyDown);
    }

    dispose() {
        window.removeEventListener('keyup', this.onKeyUp);
        window.removeEventListener('keydown', this.onKeyDown);
    }
}
