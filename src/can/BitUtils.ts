class BitUtils {
  protected bitGet(num: number, idx: number) {
    const bitField = this.dec2bin(num).split('');
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

  protected dec2bin(dec: number): string {
    const paddedBin = '000000000' + (dec >>> 0).toString(2);
    return paddedBin.substring(paddedBin.length - 8);
  }
}

export default BitUtils;
