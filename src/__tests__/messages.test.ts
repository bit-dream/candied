import Dbc from '../dbc/Dbc';
import dbcReader from '../filesystem/DbcReader';

// Async loading tests
test('DBC_template.dbc: Correct Message Count', () => {
  const dbc = new Dbc();
  const fileContent = dbcReader('src/__tests__/testFiles/DBC_template.dbc');
  const data = dbc.load(fileContent);
  expect(data.messages.size).toBe(2);
});

test('SimpleDBC.dbc: Correct Message Count', () => {
  const dbc = new Dbc();
  const fileContent = dbcReader('src/__tests__/testFiles/SimpleDBC.dbc');
  const data = dbc.load(fileContent);
  expect(data.messages.size).toBe(2);
});

test('tesla_can.dbc: Correct Message Count', () => {
  const dbc = new Dbc();
  const fileContent = dbcReader('src/__tests__/testFiles/tesla_can.dbc');
  const data = dbc.load(fileContent);
  expect(data.messages.size).toBe(42);
});

test('DBC_template.dbc: Correct Message Names', () => {
  const dbc = new Dbc();
  const fileContent = dbcReader('src/__tests__/testFiles/DBC_template.dbc');
  const data = dbc.load(fileContent);
  expect(Array.from(data.messages.keys()).sort()).toEqual(['CANMessage', 'CANMultiplexed'].sort());
});

test('DBC_template.dbc: Get Message By ID', () => {
  const dbc = new Dbc();
  const fileContent = dbcReader('src/__tests__/testFiles/DBC_template.dbc');
  const data = dbc.load(fileContent);
  const msg = dbc.data.messages.get('CANMessage');
  expect(dbc.getMessageById(1234)).toEqual(msg);
});

test('DBC_template.dbc: Correct Message Count', () => {
  const dbc = new Dbc();
  const fileContent = dbcReader('src/__tests__/testFiles/DBC_template.dbc');
  const data = dbc.load(fileContent);
  expect(data.messages.size).toBe(2);
});

// Syncronous loading tests
test('SimpleDBC.dbc: Correct Message Count (Sync Load)', () => {
  const dbc = new Dbc();
  const fileContent = dbcReader('src/__tests__/testFiles/SimpleDBC.dbc');
  const data = dbc.load(fileContent);
  expect(data.messages.size).toBe(2);
});

test('tesla_can.dbc: Correct Message Count (Sync Load)', () => {
  const dbc = new Dbc();
  const fileContent = dbcReader('src/__tests__/testFiles/tesla_can.dbc');
  const data = dbc.load(fileContent);
  expect(data.messages.size).toBe(42);
});

test('DBC_template.dbc: Correct Message Names (Sync Load)', () => {
  const dbc = new Dbc();
  const fileContent = dbcReader('src/__tests__/testFiles/DBC_template.dbc');
  const data = dbc.load(fileContent);
  expect(Array.from(data.messages.keys()).sort()).toEqual(['CANMessage', 'CANMultiplexed'].sort());
});

test('DBC_template.dbc: Get Message By ID (Sync Load)', () => {
  const dbc = new Dbc();
  const fileContent = dbcReader('src/__tests__/testFiles/DBC_template.dbc');
  const data = dbc.load(fileContent);
  const msg = dbc.data.messages.get('CANMessage');
  expect(dbc.getMessageById(1234)).toEqual(msg);
});
