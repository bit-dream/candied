import Dbc from '../dbc/Dbc';
import {IncorrectFileExtension} from '../dbc/Errors';

// All return values validated using Kvaser CANKing
test('Load: Invalid File', async () => {
  const dbc = new Dbc();
  await expect(dbc.load('src/__tests__/testFiles/dummy_file.txt')).rejects.toBeInstanceOf(IncorrectFileExtension);
});

test('LoadSync: Invalid File', () => {
  const dbc = new Dbc();
  expect(() => {
    dbc.loadSync('src/__tests__/testFiles/dummy_file.txt');
  }).toThrow(IncorrectFileExtension);
});
