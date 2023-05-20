export enum Vendors {
    Microsoft = '045e',
    Fanatec = '0eb7',
    Unknown = '0000'
}

export enum Products {
    XboxOneXController = "0b13",
    Unknown = '0000'
}

export enum ControllerType {
    Keyboard = 0,
    GamePad = 1,
    Wheel = 2,
    Unknown = 3
}

export type ControllerInfo = {
    id: string,
    vendor: Vendors,
    product: Products
    type: ControllerType
}
