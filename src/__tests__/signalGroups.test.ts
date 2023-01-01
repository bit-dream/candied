import Dbc from '../dbc/Dbc';
import dbcReader from "../filesystem/DbcReader";

test('DBC_template.dbc: Has Signal Groups', () => {
  const dbc = new Dbc();
  const fileContent = dbcReader('src/__tests__/testFiles/DBC_template.dbc');
  const data = dbc.load(fileContent);
  const canMessageStandard = dbc.getMessageById(1234);
  if (canMessageStandard) {
    expect(canMessageStandard.signalGroups.has('SignalGroup1')).toBeTruthy();
  } else {
    fail(`Data does not contain message id ${1234}`);
  }
  const canMessageExtended = dbc.getMessageById(4321);
  if (canMessageExtended) {
    expect(canMessageExtended.signalGroups.has('SignalGroup2')).toBeTruthy();
  } else {
    fail(`Data does not contain message id ${4321}`);
  }
});
