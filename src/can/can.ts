import Dbc from '../dbc/dbc';
import { MessageDoesNotExist } from '../dbc/errors';
import { DbcData, EndianType, Message, Signal } from '../dbc/types';
import { Frame, BoundMessage, BoundSignal, Payload} from './types';
import { InvalidPayloadLength } from './errors';

class Can {

  #dbc: DbcData
  constructor(dbc: DbcData) {
    this.#dbc = dbc;
  }
  
   set dbc(dbc: DbcData) {
    this.#dbc = dbc;
   }
   
   createFrame(id: number, payload: (number)[], hex=false): Frame {
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
      isExtended: id > 2048, // Only 2048 identifiers allowed in a standard frame
      payload: Array.from(byteArray)
    };
    return canFrame;
  }


  decode(frame: Frame): BoundMessage | undefined {

    const msg = this.getMessageById(frame.id);

    if (msg.dlc !== frame.dlc) {
        return undefined
    }

    let signals = new Map();
    for (const [name, signal] of msg.signals) {
        const bndSig = this.decodeSignal(frame.payload, signal);
        signals.set(name, bndSig);
    }
    
    let boundMessage = {
        name: msg.name,
        id: msg.id,
        signals
    }
    return boundMessage
  }

  private getMessageById(id: number): Message {
    const messages = this.#dbc.messages;
    for (const [name, message] of messages) {
      if (message.id === id) {
        return message;
      }
    }
    throw new MessageDoesNotExist(`No message with id ${id} exists in the database.`);
  }

  private bitGet(num: number, idx: number) {

    let bitField = this.dec2bin(num).split('');
    // Assumes least significant bit starts at the end of the array
    return bitField[idx]
  }

  private bitSet(num: (number)[], idx: number, val: number) {
    num[num.length - idx - 1] = val; 
    return num; 
  }

  decodeSignal(payload: Payload, signal: Signal): BoundSignal {

    let rawValue = this.getValue(payload, signal.startBit, signal.length, signal.endianness, signal.signed);
    
    // Apply scaling and offset
    let prcValue = (rawValue * signal.factor) + signal.offset;
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
        let enumMem = signal.valueTable.get(prcValue);
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
        physValue
    }
  }

  getValue(data: (number)[], startBit: number, signalLength: number, endian: EndianType, signed: boolean) {
    
    let signalData: (number)[] = new Array(signalLength).fill(0);
    
    let targetBit = startBit;

    for (let i = 0; i < signalLength; ++i) {

        let targetByteIndex = Math.ceil((targetBit+1) / 8);

        // Need to handle bit field correctly since LSB starts at end of array
        let targetBitIdx = (7 - (targetBit - (targetByteIndex - 1) * 8));
        let val = this.bitGet(data[targetByteIndex-1], targetBitIdx);

        if (val) {
            signalData = this.bitSet(signalData, i, Number(val));
        }

        if (endian === 'Motorola' && (targetBitIdx === 0)) {
            targetBit = targetBit - 15;
        } else {
            targetBit = targetBit + 1;
        }

    }

    let prcValue;
    if (signed) {
        prcValue = Number(this.bin2decSigned(signalData.join('')));
    } else {
        prcValue = Number(this.bin2dec(signalData.join('')));
    }

    return prcValue;
  }

  private bin2decSigned(bits: string) {
    let negative = (bits[0] === '1');
    if (negative) {
        let inverse = '';
        for (let i = 0; i < bits.length; i++) {
            inverse += (bits[i] === '0' ? '1' : '0');
        }
        return (parseInt(inverse, 2) + 1) * -1;
    } else {
        return parseInt(bits, 2);
    }
}

  private bin2dec(bin: string) {
    return parseInt(bin, 2);
  }

  private dec2bin(dec: number): string {
    const paddedBin =  ("000000000" + (dec >>> 0).toString(2))
    return paddedBin.substring(paddedBin.length - 8);
  }

}

export default Can;