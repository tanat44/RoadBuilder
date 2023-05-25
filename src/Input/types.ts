export enum Vendors {
    Microsoft = '045e',
    Fanatec = '0eb7',
    Unknown = '0000'
}

export enum MicrosoftProductId {
    XboxOneXController = "0b13",
}

export const MicrosoftProductName = {
    [MicrosoftProductId.XboxOneXController]: 'Microsoft Xbox One X Controller',
}

export enum FanatecProductId {
    PodiumWheelBaseDD1 = "0006",
}

export const FanatecProductName = {
    [FanatecProductId.PodiumWheelBaseDD1]: 'Fanatec Podium Wheel Base DD1'
}

export enum ControllerType {
    Keyboard = 0,
    GamePad = 1,
    Wheel = 2,
    Unknown = 3
}

export type ControllerInfo = {
    id: string,
    vendorId: Vendors,
    productId?: string,
    productName: string,
    type: ControllerType
}
