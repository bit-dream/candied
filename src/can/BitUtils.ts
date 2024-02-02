import { EndianType } from '../shared/DataTypes';
import { CAN_EFF_FLAG, CAN_EFF_MASK } from './Const';

class BitUtils {
  /**
   * Returns a boolean value indicating whether the provided CAN id is extended or standard
   * @param id Number
   * @protected
   */
  public isIdExtended(id: number): boolean {
    return (id & CAN_EFF_FLAG) >>> 0 === CAN_EFF_FLAG;
  }

  /**
   * Sets the extended flag in the provided ID and returns the new CAN ID
   * @param id
   */
  public setExtendedFlag(id: number): number {
    return (id | CAN_EFF_FLAG) >>> 0;
  }

  /**
   * Unsets the extended ID flag and returns the normal 29-bit CAN ID
   * @param id
   */
  public unsetExtendedFlag(id: number): number {
    return (id & CAN_EFF_MASK) >>> 0;
  }

  protected bitGet(num: number, idx: number) {
    const bitField = this.uint8ToBinary(num).split('');
    // Assumes least significant bit starts at the end of the array
    return bitField[idx];
  }

  protected bitSet(num: number[], idx: number, val: number) {
    num[num.length - idx - 1] = val;
    return num;
  }

  protected bin2decSigned(bits: string) {
    const negative = bits[0] === '1';
    if (negative) {
      let inverse = '';
      for (let i = 0; i < bits.length; i++) {
        inverse += bits[i] === '0' ? '1' : '0';
      }
      return (parseInt(inverse, 2) + 1) * -1;
    } else {
      return parseInt(bits, 2);
    }
  }

  protected bin2dec(bin: string) {
    return parseInt(bin, 2);
  }

  protected uint8ToBinary(dec: number): string {
    const paddedBin = '000000000' + (dec >>> 0).toString(2);
    return paddedBin.substring(paddedBin.length - 8);
  }

  /**
   * Converts an uint8[] payload to a binary string
   * @param payload number[] CAN payload in decimal.
   * @param endian The type of encoding, Intel vs Motorola for the payload
   */
  protected payload2Binary(payload: number[], endian: EndianType): string[] {
    let byteArray;
    if (endian === 'Intel') {
      // The splice method is here because reverse modifies
      // the original array. This could cause errors to
      // subsequent calls to this function when the top level reference is the
      // same
      byteArray = payload.slice().reverse();
    } else {
      byteArray = payload;
    }

    // Convert payload into binary string
    const bitField = byteArray
      .reduce((previous, current) => {
        return previous + this.uint8ToBinary(current);
      }, '')
      .split('');

    return bitField;
  }

  protected extractBitRange(binary: string[], startBit: number, bitRange: number, endian: EndianType): string[] {
    let startOfBit: number;
    if (endian === 'Intel') {
      startOfBit = binary.length - startBit - bitRange;
    } else {
      // Need to account for sawtooth bit numbering in CAN messages
      startOfBit = 8 * Math.floor(startBit / 8) + (7 - (startBit % 8));
      if (((startOfBit + bitRange + 1) % 8) !== 0) {
        // still unhandled
      }
    }
    return binary.slice(startOfBit, startOfBit + bitRange);
  }
}
export default BitUtils;
