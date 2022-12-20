export type DataType =
  | 'uint8'
  | 'int8'
  | 'uint16'
  | 'int16'
  | 'uint32'
  | 'int32'
  | 'uint64'
  | 'int64'
  | 'float'
  | 'double';

export type EndianType = 'Intel' | 'Motorola';

export const computeDataType = (numOfBits: number, isSigned: boolean, isFloat: boolean = false): DataType => {
  if (numOfBits === 64 && isFloat) {
    return 'double';
  } else if (numOfBits === 32 && isFloat) {
    return 'float';
  }

  if (numOfBits <= 8) {
    if (!isSigned) {
      return 'uint8';
    }
    return 'int8';
  } else if (numOfBits <= 16) {
    if (!isSigned) {
      return 'uint16';
    }
    return 'int16';
  } else if (numOfBits <= 32) {
    if (!isSigned) {
      return 'uint32';
    }
    return 'int32';
  } else if (numOfBits <= 64) {
    if (!isSigned) {
      return 'uint64';
    }
    return 'int64';
  } else if (numOfBits > 64) {
    throw new Error(`Number of bits ${numOfBits} exceeds maximum possible data type`);
  } else {
    throw new Error(
      `Could not compute data type from inputs: bits ->${numOfBits} signed-> ${isSigned} float ->${isFloat}`,
    );
  }
};
