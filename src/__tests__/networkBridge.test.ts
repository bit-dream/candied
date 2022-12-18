import Dbc from '../dbc/Dbc';

test('DBC_template.dbc: Bridge Exists', () => {
  const dbc = new Dbc();
  const data = dbc.loadSync('src/__tests__/testFiles/DBC_template.dbc');
  expect(data.networkBridges.size).toBe(1);
});
test('DBC_template.dbc: Bridge has Correct Nodes', () => {
  const dbc = new Dbc();
  const data = dbc.loadSync('src/__tests__/testFiles/DBC_template.dbc');
  expect(data.networkBridges.get(4321)).toEqual(['Node0', 'Node2']);
});
