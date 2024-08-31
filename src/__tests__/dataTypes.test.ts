import Dbc from '../dbc/Dbc';
import { computeDataType, DataType } from '../shared/DataTypes';

interface TestData {
  bitSize: number;
  isSigned: boolean;
  isFloat: boolean;
  expected: DataType;
}

test.each(<TestData[]>[
  // 8 bit types
  {
    bitSize: 0,
    isSigned: false,
    isFloat: false,
    expected: 'uint8',
  },
  {
    bitSize: 0,
    isSigned: true,
    isFloat: false,
    expected: 'int8',
  },
  {
    bitSize: 8,
    isSigned: false,
    isFloat: false,
    expected: 'uint8',
  },
  {
    bitSize: 8,
    isSigned: true,
    isFloat: false,
    expected: 'int8',
  },
  // 16 bit types
  {
    bitSize: 9,
    isSigned: false,
    isFloat: false,
    expected: 'uint16',
  },
  {
    bitSize: 9,
    isSigned: true,
    isFloat: false,
    expected: 'int16',
  },
  {
    bitSize: 16,
    isSigned: false,
    isFloat: false,
    expected: 'uint16',
  },
  {
    bitSize: 16,
    isSigned: true,
    isFloat: false,
    expected: 'int16',
  },
  // 32 bit types
  {
    bitSize: 17,
    isSigned: false,
    isFloat: false,
    expected: 'uint32',
  },
  {
    bitSize: 17,
    isSigned: true,
    isFloat: false,
    expected: 'int32',
  },
  {
    bitSize: 32,
    isSigned: false,
    isFloat: false,
    expected: 'uint32',
  },
  {
    bitSize: 32,
    isSigned: true,
    isFloat: false,
    expected: 'int32',
  },
  {
    bitSize: 32,
    isSigned: false,
    isFloat: true,
    expected: 'float',
  },
  {
    bitSize: 32,
    isSigned: true,
    isFloat: true,
    expected: 'float',
  },
  // 64 bit types
  {
    bitSize: 33,
    isSigned: false,
    isFloat: false,
    expected: 'uint64',
  },
  {
    bitSize: 33,
    isSigned: true,
    isFloat: false,
    expected: 'int64',
  },
  {
    bitSize: 64,
    isSigned: false,
    isFloat: false,
    expected: 'uint64',
  },
  {
    bitSize: 64,
    isSigned: true,
    isFloat: false,
    expected: 'int64',
  },
  {
    bitSize: 64,
    isSigned: false,
    isFloat: true,
    expected: 'double',
  },
  {
    bitSize: 64,
    isSigned: true,
    isFloat: true,
    expected: 'double',
  },
  // bit size > 64
  {
    bitSize: 65,
    isSigned: false,
    isFloat: false,
    expected: 'unknown',
  },
  {
    bitSize: 65,
    isSigned: true,
    isFloat: false,
    expected: 'unknown',
  },
  {
    bitSize: 65,
    isSigned: true,
    isFloat: true,
    expected: 'unknown',
  },
])('Compute expected dataType', (testData) => {
  const type = computeDataType(testData.bitSize, testData.isSigned, testData.isFloat);
  expect(type).toEqual(testData.expected);
});
