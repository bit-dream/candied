import { MessageDoesNotExist } from '../dbc/errors';
import { DbcData, EndianType, Message, Signal } from '../dbc/types';
import { Frame, BoundMessage, BoundSignal, Payload } from './types';
import { InvalidPayloadLength } from './errors';
import BitUtils from './BitUtils';

class Can extends BitUtils {
  #database: DbcData | undefined;
  #idMap: Map<number, Message>;

  constructor() {
    super();
    this.#idMap = new Map();
  }

  set database(dbc: DbcData) {
    this.#database = dbc;
    this.#idMap = this.messageMapTransform(this.#database.messages);
  }

  private messageMapTransform(messages: Map<string, Message>): Map<number, Message> {
    const idMap = new Map();
    for (const [key, value] of messages) {
      idMap.set(value.id, value);
    }
    return idMap;
  }

  createFrame(id: number, payload: number[], isExtended: boolean = false): Frame {
    if (payload.length > 8) {
      throw new InvalidPayloadLength(`Can not have payloads over 8 bytes: ${payload}`);
    } else if (payload.length === 0) {
      throw new InvalidPayloadLength(`Payload is either empty or undefined: ${payload}`);
    }

    // Uint8Array will ensure values don't exceed 255
    const byteArray = new Uint8ClampedArray(payload);

    const canFrame: Frame = {
      id,
      dlc: payload.length,
      isExtended,
      payload: Array.from(byteArray),
    };
    return canFrame;
  }

  decode(frame: Frame): BoundMessage | undefined {
    const msg = this.getMessageById(frame.id);
    // return undefined and make user handle non-decoded frames
    if (!msg) return msg;
    if (msg.dlc !== frame.dlc) {
      return undefined;
    }

    const signals = new Map();
    for (const [name, signal] of msg.signals) {
      const bndSig = this.decodeSignal(frame.payload, signal);
      signals.set(name, bndSig);
    }

    return {
      name: msg.name,
      id: msg.id,
      signals,
    };
  }

  private getMessageById(id: number): Message | undefined {
    return this.#idMap.get(id);
  }

  decodeSignal(payload: Payload, signal: Signal): BoundSignal {
    const rawValue = this.getValue(payload, signal.startBit, signal.length, signal.endianness, signal.signed);

    // Apply scaling and offset
    let prcValue = rawValue * signal.factor + signal.offset;
    // Determine if we need to enforce min/maxs on the value
    if (signal.min === 0 && signal.max === 0) {
      prcValue = prcValue;
    } else if (prcValue < signal.min) {
      prcValue = signal.min;
    } else if (prcValue > signal.max) {
      prcValue = signal.max;
    }

    // If we have an enumeration, return enumeration member for physical value, otherwise return with units
    let physValue: string;
    if (signal.valueTable) {
      const enumMem = signal.valueTable.get(prcValue);
      if (enumMem) {
        physValue = enumMem;
      } else {
        physValue = prcValue.toString() + (signal.unit ? ' ' + signal.unit : '');
      }
    } else {
      physValue = prcValue.toString() + (signal.unit ? ' ' + signal.unit : '');
    }

    return {
      value: prcValue,
      rawValue,
      physValue,
    };
  }

  getValue(payload: number[], startBit: number, signalLength: number, endian: EndianType, signed: boolean): number {

    const bitField = this.payload2Binary(payload, endian);
    const valBitField = this.extractBitRange(bitField, startBit, signalLength, endian);

    let prcValue;
    if (signed) {
      prcValue = Number(this.bin2decSigned(valBitField.join('')));
    } else {
      prcValue = Number(this.bin2dec(valBitField.join('')));
    }

    return prcValue;
  }
}

export default Can;
