import {IControls, Input, InputType} from "./IControls";

export class KeyboardControls implements IControls {

    private inputs: Map<InputType, Input> = new Map();

    get currentInputs(): Map<InputType, Input> {
        return this.inputs;
    }

    constructor() {
        document.onkeydown = (e: KeyboardEvent) => {
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
        };

        document.onkeyup = (e: KeyboardEvent) => {
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
        };
    }
}
