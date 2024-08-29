import Can from '../can/Can';
import Dbc from '../dbc/Dbc';
import dbcReader from '../filesystem/DbcReader';
import { BoundSignal } from '../can/CanTypes';

// All return values validated using Kvaser CANKing
test('SimpleDBC: Decode TestMessageStandard', (done) => {
  const dbc = new Dbc();
  const fileContent = dbcReader('src/__tests__/testFiles/SimpleDBC.dbc');
  const data = dbc.load(fileContent);
  const can = new Can();
  can.database = data;
  const frame = can.createFrame(256, [100, 100, 255, 55, 30, 50, 80, 50]);
  const bndMsg = can.decode(frame);

  const msg = dbc.getMessageByName('TestMessageStandard');
  if (msg) {
    const actualBndMsg = can.createBoundMessage(msg, { payload: frame.payload, isExtended: false });
    actualBndMsg.boundSignals.forEach((signal: BoundSignal) => {
      switch (signal.boundData.signal.name) {
        case 'TestSignal8':
          signal.physValue = '55';
          signal.rawValue = 55;
          signal.value = 55;
          break;
        case 'TestSignal7':
          signal.physValue = '-1';
          signal.rawValue = -1;
          signal.value = -1;
          break;
        case 'TestSignal6':
          signal.physValue = '100';
          signal.rawValue = 100;
          signal.value = 100;
          break;
        case 'TestSignal5':
          signal.physValue = '100';
          signal.rawValue = 100;
          signal.value = 100;
          break;
      }
    });
    let actual;
    let received;
    if (bndMsg) {
      received = Array.from(bndMsg.boundSignals.values()).map((signal: BoundSignal) => {
        return {
          value: signal.value,
          rawValue: signal.rawValue,
          physValue: signal.physValue,
        };
      });
    }
    if (actualBndMsg) {
      actual = Array.from(actualBndMsg.boundSignals.values()).map((signal: BoundSignal) => {
        return {
          value: signal.value,
          rawValue: signal.rawValue,
          physValue: signal.physValue,
        };
      });
    }
    expect(actual).toEqual(received);
    done();
  }
});

test('SimpleDBC: Encode TestMessageStandard', (done) => {
  const dbc = new Dbc();
  const fileContent = dbcReader('src/__tests__/testFiles/SimpleDBC.dbc');
  const data = dbc.load(fileContent);
  const can = new Can();
  can.database = data;

  const msg = dbc.getMessageByName('TestMessageStandard');
  if (msg) {
    const payload = new Array(msg.dlc).fill(0);
    const boundMessage = can.createBoundMessage(msg, { payload, isExtended: false });

    boundMessage.setSignalValue('TestSignal5', 100);
    boundMessage.setSignalValue('TestSignal6', 100);
    boundMessage.setSignalValue('TestSignal7', -1);
    boundMessage.setSignalValue('TestSignal8', 55);

    const encodedFrame = can.encode(boundMessage);
    const expectedPayload = [100, 100, 255, 55, 0, 0, 0, 0];

    expect(encodedFrame.payload).toEqual(expectedPayload);
    done();
  }
});

// Return value validated using MATLAB Vehicle Network Toolbox
test('tesla_can: Encode 264', (done) => {
  const dbc = new Dbc();
  const fileContent = dbcReader('src/__tests__/testFiles/tesla_can.dbc');
  const data = dbc.load(fileContent);
  const can = new Can();
  can.database = data;

  const msg = dbc.getMessageById(264);
  if (msg) {
    const payload = new Array(msg.dlc).fill(0);
    const boundMessage = can.createBoundMessage(msg, { payload, isExtended: false });

    boundMessage.setSignalValue('DI_torqueDriver', 522);
    boundMessage.setSignalValue('DI_torque1Counter', 6);
    boundMessage.setSignalValue('DI_torqueMotor', 750);
    boundMessage.setSignalValue('DI_soptState', 4);
    boundMessage.setSignalValue('DI_motorRPM', -233);
    boundMessage.setSignalValue('DI_pedalPos', 26.4);
    boundMessage.setSignalValue('DI_torque1Checksum', 12);

    const encodedFrame = can.encode(boundMessage);
    const expectedPayload = [10, 194, 238, 130, 23, 255, 26, 12];

    expect(encodedFrame.payload).toEqual(expectedPayload);
    done();
  }
});
