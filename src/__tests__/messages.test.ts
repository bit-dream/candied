import Dbc from '../dbc/dbc';

test('DBC_template.dbc: Correct Message Count', () => {

  const dbc = new Dbc();
  dbc.load('src/__tests__/testFiles/DBC_template.dbc')
  .then(data => {
    expect(data.messages.size).toBe(2);
  })

});

test('SimpleDBC.dbc: Correct Message Count', () => {

  const dbc = new Dbc();
  dbc.load('src/__tests__/testFiles/SimpleDBC.dbc')
  .then(data => {
    expect(data.messages.size).toBe(2);
  })

});

test('tesla_can.dbc: Correct Message Count', () => {

  const dbc = new Dbc();
  dbc.load('src/__tests__/testFiles/tesla_can.dbc')
  .then(data => {
    expect(data.messages.size).toBe(42);
  })

});
