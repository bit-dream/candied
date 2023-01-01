import Dbc from '../dbc/Dbc';
import dbcReader from "../filesystem/DbcReader";

test('DBC_template.dbc: Top level comment', () => {
  const dbc = new Dbc();
  const fileContent = dbcReader('src/__tests__/testFiles/DBC_template.dbc');
  const data = dbc.load(fileContent);
  expect(data.description).toBe('DBC Template with multiline description');
});

test('DBC_template.dbc: Message comment', () => {
  const dbc = new Dbc();
  const fileContent = dbcReader('src/__tests__/testFiles/DBC_template.dbc');
  const data = dbc.load(fileContent);
  const msg = data.messages.get('CANMultiplexed');
  expect(msg?.description).toBe('Multiplexed CAN-Message');
});

test('DBC_template.dbc: Signal comment', () => {
  const dbc = new Dbc();
  const fileContent = dbcReader('src/__tests__/testFiles/DBC_template.dbc');
  const data = dbc.load(fileContent);
  const msg = data.messages.get('CANMessage');
  const signal = msg?.signals.get('Signal0');
  expect(signal?.description).toBe('First signal in this message');
});
