import Can from '../can/Can';
import {DbcData} from '../dbc/DbcTypes';

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

test('Get Value: Unsigned Motorola', () =>{
  const can = new Can();
  expect(can.getValue([20,255,255,2,4,13,16,255],32,20,'Motorola',false))
      .toBe(983556);
  expect(can.getValue([20,255,255,2,4,13,16,255],14,10,'Motorola',false))
      .toBe(83);
  expect(can.getValue([20,255,255,2,4,13,16,255],50,4,'Motorola',false))
      .toBe(4);
  expect(can.getValue([54,20,45,2], 10, 10, 'Motorola', false))
      .toBe(389);
})

test('Get Value: Signed Motorola', () =>{
  const can = new Can();
  expect(can.getValue([20,255,255,2,4,13,16,255],22,6,'Motorola',true))
      .toBe(-1);
  expect(can.getValue([20, 255, 65, 54, 3, 20, 55, 45], 22, 10, 'Motorola', true))
      .toBe(-3);
  expect(can.getValue([54,20,45,2], 10, 10, 'Motorola', true))
      .toBe(389);
})

test('Get Value: Unsigned Intel', () =>{
  const can = new Can();
  expect(can.getValue([20,255,255,2,4,13,16,255],40,9,'Intel',false))
      .toBe(13);
  expect(can.getValue([54,20,45,2], 10, 10, 'Intel', false))
      .toBe(837);
})

test('Get Value: Signed Intel', () =>{
  const can = new Can();
  expect(can.getValue([20,255,255,2,4,13,16,255],20,27,'Intel',true))
      .toBe(13647919);
  expect(can.getValue([20,255,255,2,4,13,16,255],13,32,'Intel',true))
      .toBe(1746933759);
  expect(can.getValue([20,255,255,2,4,13,16,255],56,3,'Intel',true))
      .toBe(-1);
  expect(can.getValue([54,20,45,2], 10, 10, 'Intel', true))
      .toBe(-187);
})


test('Can Frame Creation', () => {
  const can = new Can();
  can.database = dummyData;
  expect(can.createFrame(100, [100, 100, 100], false)).toStrictEqual({
    id: 100,
    dlc: 3,
    isExtended: false,
    payload: [100, 100, 100],
  });
  expect(can.createFrame(54092340, [100, 100, 100, 10], true)).toStrictEqual({
    id: 54092340,
    dlc: 4,
    isExtended: true,
    payload: [100, 100, 100, 10],
  });
  expect(can.createFrame(10, [300, 300], false)).toStrictEqual({
    id: 10,
    dlc: 2,
    isExtended: false,
    payload: [255, 255],
  });
});

test('Get Value From Payload', () => {
  const can = new Can();
  can.database = dummyData;
  expect(can.createFrame(100, [100, 100, 100], false)).toStrictEqual({
    id: 100,
    dlc: 3,
    isExtended: false,
    payload: [100, 100, 100],
  });
});
