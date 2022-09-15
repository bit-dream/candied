export type Frame = {
    id: number;
    dlc: number;
    isExtended: boolean;
    payload: (number)[];
};

export type BoundMessage = {
    name: string;
    id: number;
    signals: Map<string,BoundSignal>;
};

export type BoundSignal = {
    value: number;
    rawValue: number;
    physValue: string;
};