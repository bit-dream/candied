import Can from '../can/Can';
import Dbc from '../dbc/Dbc';

// All return values validated using Kvaser CANKing
test('SimpleDBC: Decode TestMessageStandard', (done) => {
  const dbc = new Dbc();
  const data = dbc.load('src/__tests__/testFiles/SimpleDBC.dbc').then((data) => {
    const can = new Can();
    can.database = data;
    const frame = can.createFrame(256, [100, 100, 255, 55, 30, 50, 80, 50]);
    const bndMsg = can.decode(frame);

    const signals = new Map();
    signals.set('TestSignal5', {
      physValue: '100',
      rawValue: 100,
      value: 100
    });
    signals.set('TestSignal6', {
      physValue: '100',
      rawValue: 100,
      value: 100,
    });
    signals.set('TestSignal7', {
      physValue: '-1',
      rawValue: -1,
      value: -1,
    });
    signals.set('TestSignal8', {
      physValue: '55',
      rawValue: 55,
      value: 55,
    });
    expect(bndMsg?.boundSignals).toEqual(signals);
    done();
  });
});

test('SimpleDBC: Decode TestMessageExtended', () => {
  const dbc = new Dbc();
  let data = dbc.load('src/__tests__/testFiles/SimpleDBC.dbc').then((data) => {
    const can = new Can();
    can.database = data;
    const frame = can.createFrame(2147484160, [20, 25, 250, 50, 60, 120, 40, 53]);
    const bndMsg = can.decode(frame);

    let signals = new Map();
    signals.set('TestSignal1', {
      physValue: '20',
      rawValue: 20,
      value: 20,
    });
    signals.set('TestSignal2', {
      physValue: '25',
      rawValue: 25,
      value: 25,
    });
    signals.set('TestSignal3', {
      physValue: '-6',
      rawValue: -6,
      value: -6,
    });
    signals.set('TestSignal4', {
      physValue: '50',
      rawValue: 50,
      value: 50,
    });
    expect(bndMsg?.boundSignals).toEqual(signals);
  });
});

test('tesla_can: Decode TestMessageExtended', () => {
  const dbc = new Dbc();
  let data = dbc.load('src/__tests__/testFiles/tesla_can.dbc').then((data) => {
    const can = new Can();
    can.database = data;
    const frame = can.createFrame(280, [20, 25, 250, 50, 60, 120]);
    const bndMsg = can.decode(frame);
    let signals = new Map();
    signals.set('DI_brakePedal', {
      physValue: 'Not_applied',
      rawValue: 0,
      value: 0,
    });
    signals.set('DI_brakePedalState', {
      physValue: 'SNA',
      rawValue: 3,
      value: 3,
    });
    signals.set('DI_epbInterfaceReady', {
      physValue: 'EPB_INTERFACE_NOT_READY',
      rawValue: 0,
      value: 0,
    });
    signals.set('DI_epbParkRequest', {
      physValue: 'No_request',
      rawValue: 0,
      value: 0,
    });
    signals.set('DI_gear', {
      physValue: 'DI_GEAR_P',
      rawValue: 1,
      value: 1,
    });
    signals.set('DI_gearRequest', {
      physValue: 'DI_GEAR_N',
      rawValue: 3,
      value: 3,
    });
    signals.set('DI_torque2Checksum', {
      physValue: '120',
      rawValue: 120,
      value: 120,
    });
    signals.set('DI_torque2Counter', {
      physValue: '12',
      rawValue: 12,
      value: 12,
    });
    signals.set('DI_torqueEstimate', {
      physValue: '-750 Nm',
      rawValue: -1772,
      value: -750,
    });
    signals.set('DI_torqueInterfaceFailure', {
      physValue: 'TORQUE_INTERFACE_NORMAL',
      rawValue: 0,
      value: 0,
    });
    signals.set('DI_vehicleSpeed', {
      physValue: '13.100000000000001 MPH',
      rawValue: 762,
      value: 13.100000000000001,
    });
    expect(bndMsg?.boundSignals).toEqual(signals);
  });
});
