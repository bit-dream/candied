import Dbc from '../dbc/dbc';
import { Attribute, Attributes } from '../dbc/types';

test('DBC_template.dbc: Has Signal Groups', () => {
    const dbc = new Dbc();
    const data = dbc.loadSync('src/__tests__/testFiles/DBC_template.dbc')
    const canMessageStandard = dbc.getMessageById(1234);
    if (canMessageStandard) {
        expect(canMessageStandard.signalGroups.has('SignalGroup1')).toBeTruthy();
    } else {
        fail(`Data does not contain message id ${1234}`)
    }
    const canMessageExtended = dbc.getMessageById(4321);
    if (canMessageExtended) {
        expect(canMessageExtended.signalGroups.has('SignalGroup2')).toBeTruthy();
    } else {
        fail(`Data does not contain message id ${4321}`)
    }
});
