import Dbc from '../dbc/Dbc';
import dbcReader from "../filesystem/DbcReader";

test('Floats.dbc: Float (single) caught in data', () => {
  const dbc = new Dbc();
  const fileContent = dbcReader('src/__tests__/testFiles/Floats.dbc');
  dbc.load(fileContent);
  expect(dbc.data.messages.get('FloatMessage')?.signals.get('FloatSignal1')).toMatchObject({ dataType: 'float' });
});

test('Floats.dbc: Double caught in data', () => {
  const dbc = new Dbc();
  const fileContent = dbcReader('src/__tests__/testFiles/Floats.dbc');
  dbc.load(fileContent);
  expect(dbc.data.messages.get('DoubleMessage')?.signals.get('DoubleSignal1')).toMatchObject({ dataType: 'double' });
});
