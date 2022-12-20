import { DbcData, EndianType, Message, Signal } from '../dbc/DbcTypes';
import { InvalidPayloadLength } from './Errors';
import BitUtils from './BitUtils';

/**
 * The Can class offers utility functions that aid in the processing of general CAN data/information
 * It aids in the encoding/decoding of CAN messages, CAN frame creation, and more.
 *
 * The class can be loaded with a database using the setter function 'database'
 * i.e. const can = new Can(); can.database = data.
 * data in this context will need to be of the specified type (DbcData) and not the database file itself. Use the other
 * built in class for actually getting this data, such as the Dbc() class.
 */
class Can extends BitUtils {
  _database: DbcData | undefined;
  #idMap: Map<number, Message>;

  constructor() {
    super();
    this.#idMap = new Map();
  }

  /**
   * Setter that allows you to load in a CAN database object to used in
   * message/signal encoding and decoding
   * @param dbc DbcData
   */
  set database(dbc: DbcData) {
    this._database = dbc;
    this.#idMap = this.messageMapTransform(this._database.messages);
  }

  private messageMapTransform(messages: Map<string, Message>): Map<number, Message> {
    const idMap = new Map();
    for (const [key, value] of messages) {
      idMap.set(value.id, value);
    }
    return idMap;
  }

  /**
   *
   * @param id CAN ID of the message
   * @param payload Payload of the CAN message as an Uint8 Array. i.e. [255, 20, 10]
   * @param isExtended Whether or not the CAN ID is extended or standard. false by default.
   */
  createFrame(id: number, payload: number[], isExtended: boolean = false): Frame {
    if (payload.length > 8) {
      throw new InvalidPayloadLength(`Can not have payloads over 8 bytes: ${payload}`);
    } else if (payload.length === 0) {
      throw new InvalidPayloadLength(`Payload is either empty or undefined: ${payload}`);
    }

    // Uint8Array will ensure values don't exceed 255
    const byteArray = new Uint8ClampedArray(payload);

    return {
      id,
      dlc: payload.length,
      isExtended,
      payload: Array.from(byteArray),
    };
  }

  /**
   * General purpose CAN message decode function. Expects a CAN frame and will return a
   * BoundMessage type. The BoundMessage will have BoundSignals attached that will have
   * the decoded physical values.
   *
   * A database needs to be loaded using the database setter before messages can be decoded,
   * otherwise an error is returned.
   *
   * When decoding a message and the ID does not exist in the provided database, undefined will be
   * returned from the function. If you are live decoding data, make sure to check for the undefined condition
   * before trying to do anything with the returned data
   * @param frame CAN Frame
   * @returns BoundMessage | undefined
   */
  decode(frame: Frame): BoundMessage | undefined {
    if (this._database === undefined) {
      throw new Error('No database is attached to class instance');
    }
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
      boundSignals: signals,
      boundData: {
        frame,
        message: msg,
      },
      setSignalValue: (signal, value) => {
        return {};
      },
    };
  }

  private getMessageById(id: number): Message | undefined {
    return this.#idMap.get(id);
  }

  private applyPropsToSignalValue(
    signal: Signal,
    rawValue: number,
  ): {
    rawValue: number;
    prcValue: number;
    physValue: string;
  } {
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
      rawValue,
      prcValue,
      physValue,
    };
  }

  /**
   * Similar to the decode method, but operates on a Signal specific context. Will only decode the signal provided
   * to the function. This function is useful if wanting to decode an individual signal rather than a whole message.
   *
   * signal needs to a type Signal. You can grab the signal you want referencing the Can class's _database property or
   * by providing your own by either creating it with the Dbc() class or using one provided by loading a DBC file into
   * the Dbc() class with .load() or .loadSync()
   * @param payload Uint8 number[]
   * @param signal Signal
   */
  decodeSignal(payload: Payload, signal: Signal): BoundSignal {
    const rawValue = this.extractValFromPayload(
      payload,
      signal.startBit,
      signal.length,
      signal.endianness,
      signal.signed,
    );

    const signalValues = this.applyPropsToSignalValue(signal, rawValue);
    return {
      boundData: {
        payload,
        signal,
      },
      setValue(value: number): {} {
        return {};
      },
      value: signalValues.prcValue,
      rawValue: signalValues.rawValue,
      physValue: signalValues.physValue,
    };
  }

  /**
   *
   * Generalized function for extracting an individual value from a CAN message payload.
   *
   * @param payload number[]
   * @param startBit number
   * @param signalLength number
   * @param endian 'Motorola' | 'Intel'
   * @param signed boolean
   */
  extractValFromPayload(
    payload: number[],
    startBit: number,
    signalLength: number,
    endian: EndianType,
    signed: boolean,
  ): number {
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

  setSignalValues() {
    return null;
  }

  private createBoundSignal(signal: Signal, payload: Payload, initalValue: number = 0): BoundSignal {
    const signalValues = this.applyPropsToSignalValue(signal, initalValue);

    const boundSignal = {
      boundData: {
        signal,
        payload,
      },
      value: signalValues.prcValue,
      rawValue: signalValues.rawValue,
      physValue: signalValues.physValue,
      setValue: (value: number) => {
        const newValues = this.applyPropsToSignalValue(signal, value);
        boundSignal.value = newValues.prcValue;
        boundSignal.rawValue = newValues.rawValue;
        boundSignal.physValue = newValues.physValue;
      },
    };
    return boundSignal as BoundSignal;
  }

  /**
   * This function will create a BoundMessage from an existing database Message. If frameData is not entered as
   * an input parameter to the function, createBoundMessage() will create a BoundMessage payload based on the DLC of
   * the message. The payload will be initialized to all 0s. Assumes the message is not extended by default.
   *
   * If createBoundMessage is provided frameData, the boundMessage will be created on that context.
   * @param message Message
   * @param frameData {payload: number[], isExtended: boolean} | null
   */
  createBoundMessage(
    message: Message,
    frameData: { payload: Payload; isExtended: boolean } | null = null,
  ): BoundMessage {
    // Initialize an empty payload based on message dlc if payload is not specified
    let boundPayload: Payload;
    if (frameData && frameData.payload) {
      if (frameData.payload.length !== message.dlc) {
        throw new Error(
          `Supplied payload length: ${frameData.payload.length} does not match message DLC length: ${message.dlc}`,
        );
      }
      boundPayload = frameData.payload;
    } else {
      boundPayload = new Array(message.dlc).fill(0);
    }

    let extended: boolean;
    if (frameData && frameData.isExtended) {
      extended = frameData.isExtended;
    } else {
      extended = false;
    }

    const frame = this.createFrame(message.id, boundPayload, extended);

    const boundSignals = new Map();
    message.signals.forEach((signal: Signal) => {
      boundSignals.set(signal.name, this.createBoundSignal(signal, boundPayload, 0));
    });

    const boundMessage = {
      name: message.name,
      id: message.id,
      boundSignals,
      boundData: {
        frame,
        message,
      },
      setSignalValue: (signal: string, value: number) => {
        const bndSignal = boundMessage.boundSignals.get(signal);
        if (bndSignal) {
          bndSignal.setValue(value);
        }
      },
    };

    return boundMessage as BoundMessage;
  }
}
export default Can;

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