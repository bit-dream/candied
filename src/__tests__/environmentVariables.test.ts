import Dbc from '../dbc/dbc';
import { Attribute, Attributes } from '../dbc/types';

test('DBC_template_v2.dbc: Environmental Variables Exist', () => {
  const dbc = new Dbc();
  const data = dbc.loadSync('src/__tests__/testFiles/DBC_template_v2.dbc');
  expect(data.environmentVariables.has('UnrestrictedEnvVar')).toBeTruthy();
  expect(data.environmentVariables.has('RWEnvVar_wData')).toBeTruthy();
  expect(data.environmentVariables.has('WriteOnlyEnvVar')).toBeTruthy();
  expect(data.environmentVariables.has('ReadOnlyEnvVar')).toBeTruthy();
});

test('DBC_template_v2.dbc: Correct Access Levels', () => {
  const dbc = new Dbc();
  const data = dbc.loadSync('src/__tests__/testFiles/DBC_template_v2.dbc');
  expect(data.environmentVariables.get('UnrestrictedEnvVar')?.accessType).toBe('Unrestricted');
  expect(data.environmentVariables.get('RWEnvVar_wData')?.accessType).toBe('ReadWrite');
  expect(data.environmentVariables.get('WriteOnlyEnvVar')?.accessType).toBe('Write');
  expect(data.environmentVariables.get('ReadOnlyEnvVar')?.accessType).toBe('Read');
});

test('DBC_template_v2.dbc: Correct Min/Max', () => {
  const dbc = new Dbc();
  const data = dbc.loadSync('src/__tests__/testFiles/DBC_template_v2.dbc');
  expect(data.environmentVariables.get('UnrestrictedEnvVar')?.min).toBe(0);
  expect(data.environmentVariables.get('UnrestrictedEnvVar')?.max).toBe(0);
  expect(data.environmentVariables.get('WriteOnlyEnvVar')?.min).toBe(0);
  expect(data.environmentVariables.get('WriteOnlyEnvVar')?.max).toBe(1234);
});

test('DBC_template_v2.dbc: Correct Units', () => {
  const dbc = new Dbc();
  const data = dbc.loadSync('src/__tests__/testFiles/DBC_template_v2.dbc');
  expect(data.environmentVariables.get('UnrestrictedEnvVar')?.unit).toBe('Nm');
  expect(data.environmentVariables.get('RWEnvVar_wData')?.unit).toBe('');
  expect(data.environmentVariables.get('ReadOnlyEnvVar')?.unit).toBe('MPH');
});

test('DBC_template_v2.dbc: Has Attributes', () => {
  const dbc = new Dbc();
  const data = dbc.loadSync('src/__tests__/testFiles/DBC_template_v2.dbc');
  expect(data.environmentVariables.get('RWEnvVar_wData')?.attributes.size).toBe(1);
});

test('DBC_template_v2.dbc: Has Data Length and Value', () => {
  const dbc = new Dbc();
  const data = dbc.loadSync('src/__tests__/testFiles/DBC_template_v2.dbc');
  expect(data.environmentVariables.get('RWEnvVar_wData')?.dataBytesLength).toBe(10);
  expect(data.environmentVariables.get('RWEnvVar_wData')?.attributes.get('RWEnvVar_wData')?.value).toBe('3');
});
