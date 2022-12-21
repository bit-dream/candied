import Dbc from '../dbc/Dbc';

test('Floats.dbc: Float (single) caught in data', () => {
  const dbc = new Dbc();
  dbc.loadSync('src/__tests__/testFiles/Floats.dbc');
  expect(dbc.data.messages.get('FloatMessage')?.signals.get('FloatSignal1')).toMatchObject({ dataType: 'float' });
});

test('Floats.dbc: Double caught in data', () => {
  const dbc = new Dbc();
  dbc.loadSync('src/__tests__/testFiles/Floats.dbc');
  expect(dbc.data.messages.get('DoubleMessage')?.signals.get('DoubleSignal1')).toMatchObject({ dataType: 'double' });
});
