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

  // Utility function to convert decimal to binary string
  protected dec2bin(dec: number, length: number): string {
    return (dec >>> 0).toString(2).padStart(length, '0');
  }

  /**
   * Converts a signed decimal number to a binary string.
   *
   * @param dec number
   * @param length number
   * @returns string
   */
  protected dec2binSigned(dec: number, length: number): string {
    if (dec < 0) {
      dec = (1 << length) + dec; // Convert negative number to two's complement
    }
    return dec.toString(2).padStart(length, '0');
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

  /**
   * Convert a binary string array into a byte array
   *
   * @param binaryArray string[]
   * @returns number[]
   */
  protected binary2Payload(binaryArray: string[], endian: EndianType): number[] {
    const byteArray = [];
    for (let i = 0; i < binaryArray.length; i += 8) {
      byteArray.push(parseInt(binaryArray.slice(i, i + 8).join(''), 2));
    }
    if (endian === 'Intel') {
      return byteArray.reverse();
    }
    return byteArray;
  }

  protected getStartOfBit(length: number, startBit: number, bitRange: number, endian: EndianType): number {
    let startOfBit: number;
    if (endian === 'Intel') {
      startOfBit = length - startBit - bitRange;
    } else {
      const endOfBitField = 8 * Math.floor(startBit / 8) + (7 - (startBit % 8));
      // Need to account for sawtooth bit numbering in CAN messages
      startOfBit = endOfBitField - bitRange + 1;
      // startOfBit = length - (length - startBit + bitRange);
    }
    return startOfBit;
  }

  protected extractBitRange(binary: string[], startBit: number, bitRange: number, endian: EndianType): string[] {
    let startOfBit: number;
    startOfBit = this.getStartOfBit(binary.length, startBit, bitRange, endian);
    return binary.slice(startOfBit, startOfBit + bitRange);
  }

  /**
   * Inserts a bitField into a specific range within the binary string array.
   *
   * @param binary string[]
   * @param bitField string
   * @param startBit number
   * @param bitRange number
   * @param endian EndianType ('Motorola' or 'Intel')
   * @returns string[]
   */
  protected insertBitRange(
    binary: string[],
    bitField: string,
    startBit: number,
    bitRange: number,
    endian: EndianType,
  ): string[] {
    let startOfBit: number;

    startOfBit = this.getStartOfBit(binary.length, startBit, bitRange, endian);
    for (let i = 0; i < bitRange; i++) {
      binary[startOfBit + i] = bitField[i] || '0';
    }
    return binary;
  }
}
export default BitUtils;
