import Dbc from '../dbc/Dbc';
import dbcReader from '../filesystem/DbcReader';

test('DBC_template.dbc: Bridge Exists', () => {
  const dbc = new Dbc();
  const fileContent = dbcReader('src/__tests__/testFiles/DBC_template.dbc');
  const data = dbc.load(fileContent);
  expect(data.networkBridges.size).toBe(1);
});
test('DBC_template.dbc: Bridge has Correct Nodes', () => {
  const dbc = new Dbc();
  const fileContent = dbcReader('src/__tests__/testFiles/DBC_template.dbc');
  const data = dbc.load(fileContent);
  expect(data.networkBridges.get(4321)).toEqual(['Node0', 'Node2']);
});
