import { EndianType } from '../shared/DataTypes';

class BitUtils {
  static bigEndianBitOrder = [
    7, 6, 5, 4, 3, 2, 1, 0,
    15, 14, 13, 12, 11, 10, 9, 8,
    23, 22, 21, 20, 19, 18, 17, 16,
    31, 30, 29, 28, 27, 26, 25, 24,
    39, 38, 37, 36, 35, 34, 33, 32,
    47, 46, 45, 44, 43, 42, 41, 40,
    55, 54, 53, 52, 51, 50, 49, 48,
    63, 62, 61, 60, 59, 58, 57, 56
  ];

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
      startOfBit = BitUtils.bigEndianBitOrder.indexOf(startBit);
    }
    return binary.slice(startOfBit, startOfBit + bitRange);
  }
}
export default BitUtils;
