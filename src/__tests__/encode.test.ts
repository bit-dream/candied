import Can from '../can/Can';
import { DbcData } from '../dbc/DbcTypes';

/*
All the expected data in the following toBe functions are not
magic numbers. These numbers were pre-calculated using tools like
Mathworks MATLAB's Vehicle Network Toolbox and Kvaser's CANKing using the
same input parameters. This was to ensure that tested values returned would
actually match more sophisticated tooling that is known to work.
 */

test('Set Value: Unsigned Motorola', () => {
  const can = new Can();
  expect(can.insertValToPayload(new Array(8).fill(0), 25, 20, 16, 'Motorola', false)).toEqual([
    0, 1, 144, 0, 0, 0, 0, 0,
  ]);
  expect(can.insertValToPayload(new Array(8).fill(0), 350, 25, 11, 'Motorola', false)).toEqual([
    0, 0, 2, 188, 0, 0, 0, 0,
  ]);
  expect(can.insertValToPayload(new Array(8).fill(0), 235, 41, 12, 'Motorola', false)).toEqual([
    0, 0, 0, 0, 1, 214, 0, 0,
  ]);
  expect(can.insertValToPayload(new Array(4).fill(0), 288, 14, 10, 'Motorola', false)).toEqual([72, 0, 0, 0]);
});

test('Set Value: Signed Motorola', () => {
  const can = new Can();
  expect(can.insertValToPayload(new Array(8).fill(0), -25, 20, 16, 'Motorola', true)).toEqual([
    15, 254, 112, 0, 0, 0, 0, 0,
  ]);
  expect(can.insertValToPayload(new Array(8).fill(0), -350, 25, 11, 'Motorola', true)).toEqual([
    0, 0, 13, 68, 0, 0, 0, 0,
  ]);
  expect(can.insertValToPayload(new Array(8).fill(0), -235, 41, 12, 'Motorola', true)).toEqual([
    0, 0, 0, 0, 30, 42, 0, 0,
  ]);
  expect(can.insertValToPayload(new Array(4).fill(0), -288, 14, 10, 'Motorola', true)).toEqual([184, 0, 0, 0]);
});

test('Set Value: Unsigned Intel', () => {
  const can = new Can();
  expect(can.insertValToPayload(new Array(8).fill(0), 25, 0, 16, 'Intel', false)).toEqual([25, 0, 0, 0, 0, 0, 0, 0]);
  expect(can.insertValToPayload(new Array(8).fill(0), 350, 5, 11, 'Intel', false)).toEqual([192, 43, 0, 0, 0, 0, 0, 0]);
  expect(can.insertValToPayload(new Array(8).fill(0), 235, 41, 12, 'Intel', false)).toEqual([0, 0, 0, 0, 0, 214, 1, 0]);
  expect(can.insertValToPayload(new Array(4).fill(0), 288, 4, 10, 'Intel', false)).toEqual([0, 18, 0, 0]);
});

test('Set Value: Signed Intel', () => {
  const can = new Can();
  expect(can.insertValToPayload(new Array(8).fill(0), -25, 0, 16, 'Intel', true)).toEqual([231, 255, 0, 0, 0, 0, 0, 0]);
  expect(can.insertValToPayload(new Array(8).fill(0), -350, 5, 11, 'Intel', true)).toEqual([64, 212, 0, 0, 0, 0, 0, 0]);
  expect(can.insertValToPayload(new Array(8).fill(0), -235, 41, 12, 'Intel', true)).toEqual([0, 0, 0, 0, 0, 42, 30, 0]);
  expect(can.insertValToPayload(new Array(4).fill(0), -288, 4, 10, 'Intel', true)).toEqual([0, 46, 0, 0]);
});
