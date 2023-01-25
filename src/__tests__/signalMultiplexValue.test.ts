import Dbc from '../dbc/Dbc';
import dbcReader from '../filesystem/DbcReader';

// Async loading tests
test('DBC_SigMulVal.dbc: Correct Message Count', () => {
    const dbc = new Dbc();
    const fileContent = dbcReader('src/__tests__/testFiles/DBC_SigMulVal.dbc');
    const data = dbc.load(fileContent);
    expect(data.messages.size).toBe(2);
});

test('DBC_SigMulVal.dbc: Correct Message Signal Count', () => {
    const dbc = new Dbc();
    const fileContent = dbcReader('src/__tests__/testFiles/DBC_SigMulVal.dbc');
    const data = dbc.load(fileContent);
    expect(data.messages.get("ExtendedMultiplexMessage")?.signals.size).toBe(10);
    expect(data.messages.get("OBD2")?.signals.size).toBe(6);
});

test('DBC_SigMulVal.dbc: Correct Message Base Signal Count', () => {
    const dbc = new Dbc();
    const fileContent = dbcReader('src/__tests__/testFiles/DBC_SigMulVal.dbc');
    const data = dbc.load(fileContent);
    expect(data.messages.get("ExtendedMultiplexMessage")?.baseSignals.size).toBe(3);
    expect(data.messages.get("OBD2")?.baseSignals.size).toBe(2);
});

test('DBC_SigMulVal.dbc: Correct Message Multiplex Signal Count', () => {
    const dbc = new Dbc();
    const fileContent = dbcReader('src/__tests__/testFiles/DBC_SigMulVal.dbc');
    const data = dbc.load(fileContent);
    expect(data.messages.get("ExtendedMultiplexMessage")?.multiplexSignals.size).toBe(1);
    expect(data.messages.get("OBD2")?.multiplexSignals.size).toBe(1);
});