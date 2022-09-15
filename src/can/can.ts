import Dbc from '../dbc/dbc';
import { MessageDoesNotExist } from '../dbc/errors';
import { DbcData, EndianType, Message } from '../dbc/types';
import { Frame, BoundMessage, BoundSignal} from './canTypes';
import { InvalidPayloadLength } from './errors';

class Can {

  constructor() {
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

  /*
  decode(frame: Frame) {
    // Convert 
    const bin = this.decArr2bin(frame.payload);
    const msg = this.getMessageById(frame.id);

    let signals = new Map();
    for (const [name, signal] of msg.signals) {
    }
    
    let boundMessage: BoundMessage = {
        name: msg.name,
        id: msg.id,
        signals
    }
    return boundMessage
  }
  */

  /*
  private getMessageById(id: number): Message {
    const messages = this.#dbc.messages;
    for (const [name, message] of messages) {
      if (message.id === id) {
        return message;
      }
    }
    throw new MessageDoesNotExist(`No message with id ${id} exists in the database.`);
  }
  */

  extractBits(data: (string)[], startBit: number, length: number, endian: EndianType) {
    
    let bin: string;
    switch (endian) {
        case 'Intel':
            // Rearrange byte order to 8 -> 7 -> 6 -> 5 -> 4 -> 3 -> 2 -> 1
            bin = data.reduceRight((previousVal,currentVal) => previousVal + currentVal);
            bin = bin.slice((length - startBit) - startBit + 1, length - startBit);
            break;
        case 'Motorola':
            bin = data.join('');
            bin = bin.slice((length - startBit) - startBit + 1, length - startBit);
            break;
    }

    return bin;
  }

  private requiredBits(bitLen: number) {
    
    let minNumBits = 8;
    if (bitLen > 8 && bitLen <= 16) {
        minNumBits = 16;
    } else if (bitLen > 16 && bitLen <= 32) {
        minNumBits = 32;
    } else if (bitLen >= 32 && bitLen <= 64) {
        minNumBits = 64;
    } else if (bitLen > 64) {
        throw Error(`Length of bits exceeds the length a CAN frame can store: ${bitLen} `)
    }

    return minNumBits
  }

  bitGet(num: number, idx: number) {

    let bitField = this.dec2bin(num).split('');
    // Assumes least significant bit starts at the end of the array
    return bitField[idx]
  }

  bitSet(num: (number)[], idx: number, val: number) {
    num[num.length - idx - 1] = val; 
    return num; 
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

  bin2decSigned(bits: string) {
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

  bin2dec(bin: string) {
    return parseInt(bin, 2);
  }

  decArr2bin(bytes: (number)[]) {
    let binArr = bytes.map((num) => this.dec2bin(num))
    
    //const binStrArr = bytes.reduce((str, byte) => str + byte.toString(2).padStart(8, '0'), '').split('');
    //return binStrArr.map((b)=>parseInt(b,10));
    return binArr
  }

  dec2bin(dec: number): string {
    const paddedBin =  ("000000000" + (dec >>> 0).toString(2))
    return paddedBin.substring(paddedBin.length - 8);
  }

}

export default Can;