import Dbc from '../dbc/Dbc';
import dbcReader from '../filesystem/DbcReader';

test('tesla_can.dbc: Number of Value Tables', () => {
  const dbc = new Dbc();
  const dbcContent = dbcReader('src/__tests__/testFiles/tesla_can.dbc');
  const data = dbc.load(dbcContent);
  if (data.valueTables) {
    expect(data.valueTables.size).toBe(16);
  } else {
    fail('Object is possibly null, when it should be a Map of size 16');
  }
});

test('tesla_can.dbc: Value table keys', () => {
  const dbc = new Dbc();
  const dbcContent = dbcReader('src/__tests__/testFiles/tesla_can.dbc');
  const data = dbc.load(dbcContent);
  if (data.valueTables) {
    expect(Array.from(data.valueTables.keys())).toStrictEqual([
      'StW_AnglHP_Spd',
      'DI_aebFaultReason',
      'DI_aebLockState',
      'DI_aebSmState',
      'DI_aebState',
      'DI_epbInterfaceReady',
      'DI_gear',
      'DI_gpoReason',
      'DI_immobilizerCondition',
      'DI_immobilizerState',
      'DI_limpReason',
      'DI_mode',
      'DI_motorType',
      'DI_speedUnits',
      'DI_state',
      'DI_velocityEstimatorState',
    ]);
  } else {
    fail('Object is possibly null, when it should be a Map of size 16');
  }
});
