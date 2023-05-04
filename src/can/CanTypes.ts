import { Message, Signal } from '../dbc/DbcTypes';

export type Frame = {
  id: number;
  dlc: number;
  isExtended: boolean;
  payload: Payload;
};
export type BoundMessage = {
  boundData: {
    message: Message;
    frame: Frame;
  };
  boundSignals: Map<string, BoundSignal>;
  id: number;
  name: string;
  setSignalValue: (signal: string, value: number) => {};
};
export type BoundSignal = {
  boundData: {
    signal: Signal;
    payload: Payload;
  };
  value: number;
  rawValue: number;
  physValue: string;
  setValue: (value: number) => {};
};
export type Payload = number[];
