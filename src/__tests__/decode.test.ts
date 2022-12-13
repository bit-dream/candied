import Can from '../can/Can';
import { DbcData } from '../dbc/types';

const dummyData: DbcData = {
  version: null,
  messages: new Map(),
  description: null,
  busSpeed: null,
  nodes: new Map(),
  valueTables: null,
  attributes: new Map(),
  newSymbols: new Array(),
  environmentVariables: new Map(),
};

test('Can Frame Creation', () => {
  const can = new Can(dummyData);
  expect(can.createFrame(100, [100, 100, 100])).toStrictEqual({
    id: 100,
    dlc: 3,
    isExtended: false,
    payload: [100, 100, 100],
  });
  expect(can.createFrame(54092340, [100, 100, 100, 10])).toStrictEqual({
    id: 54092340,
    dlc: 4,
    isExtended: true,
    payload: [100, 100, 100, 10],
  });
  expect(can.createFrame(10, [300, 300])).toStrictEqual({
    id: 10,
    dlc: 2,
    isExtended: false,
    payload: [255, 255],
  });
});

test('Get Value From Payload', () => {
  const can = new Can(dummyData);
  expect(can.createFrame(100, [100, 100, 100])).toStrictEqual({
    id: 100,
    dlc: 3,
    isExtended: false,
    payload: [100, 100, 100],
  });
});
