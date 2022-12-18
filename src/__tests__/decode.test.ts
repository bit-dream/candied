import Can from '../can/can';
import {DbcData} from '../dbc/types';

/*
All the expected data in the following toBe functions are not
magic numbers. These numbers were pre-calculated using tools like
Mathworks MATLAB's Vehicle Network Toolbox and Kvaser's CANKing using the
same input parameters. This was to ensure that tested values returned would
actually match more sophisticated tooling that is known to work.
 */

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
  networkBridges: new Map(),
};

test('Get Value: Unsigned/Intel', () =>{
  const can = new Can();

  // Settings for decode
  const payload = [20,255,255,2,4,13,16,255];
  const startbit = 36;
  const bitLength = 23;
  const byteOrder = 'Intel';
  const signed = false;

  const value = can.getValue(payload,startbit,bitLength,byteOrder,signed);
  expect(value).toEqual(7405776)
})

test('Get Value: [20,255,255,2,4,13,16,255]', () =>{
  const can = new Can();

  // Settings for decode
  const payload = [20,255,255,2,4,13,16,255];

  // Signal1
  expect(can.getValue(payload,32,20,'Motorola',false))
      .toBe(983556);
  // Signal2
  expect(can.getValue(payload,14,10,'Motorola',false))
      .toBe(83);
  // Signal3
  expect(can.getValue(payload,50,4,'Motorola',false))
      .toBe(4);
  // Signal4
  expect(can.getValue(payload,40,9,'Intel',false))
      .toBe(13);
  // Signal5
  expect(can.getValue(payload,54,10,'Intel',true))
      .toBe(-4);
  // Signal6
  expect(can.getValue(payload,22,6,'Motorola',true))
      .toBe(-1);
  expect(can.getValue(payload,20,27,'Intel',true))
      .toBe(13647919);
  expect(can.getValue(payload,13,32,'Intel',true))
      .toBe(1746933759);
  expect(can.getValue(payload,56,3,'Intel',true))
      .toBe(-1);
})

test('Get Value: [20,255,65,54,3,20,55,45]', () => {
  const can = new Can();

  // Settings for decode
  const payload = [20, 255, 65, 54, 3, 20, 55, 45];

  expect(can.getValue(payload, 22, 10, 'Motorola', true))
      .toBe(-3);
})

test('Get Value: [54,20,45,2]', () => {
  const can = new Can();

  // Settings for decode
  const payload = [54,20,45,2];

  expect(can.getValue(payload, 10, 10, 'Motorola', false))
      .toBe(389);
  expect(can.getValue(payload, 10, 10, 'Intel', false))
      .toBe(837);
  expect(can.getValue(payload, 10, 10, 'Motorola', true))
      .toBe(389);
  expect(can.getValue(payload, 10, 10, 'Intel', true))
      .toBe(-187);
})

/*
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
*/