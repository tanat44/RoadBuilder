import { IDisposable } from "../types";

export interface IController extends IDisposable {
    readonly currentInputs: Map<InputType, Input>
}

export enum InputType {
    Up = 0,
    Down = 1,
    Left = 2,
    Right = 3,
}

export type Input = {
    readonly name: InputType
    readonly value: number
}
