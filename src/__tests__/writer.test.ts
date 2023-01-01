import Dbc from '../dbc/Dbc';
import Writer from '../dbc/Writer';
import * as fs from 'fs';
import dbcWriter from "../filesystem/DbcWriter";
import dbcReader from "../filesystem/DbcReader";

test('DBC_template.dbc: Correct Messages Written to File', (done) => {
  const testFile = 'src/__tests__/testFiles/test.dbc';
  // Expected
  const dbc = new Dbc();
  const content = dbcReader('src/__tests__/testFiles/DBC_template.dbc');
  const data = dbc.load(content);
  const writer = new Writer();
  const dbcString = writer.constructFile(data);
  dbcWriter(testFile,dbcString);

  // Actual
  const writerDbc = new Dbc();
  const writerContent = dbcReader(testFile);
  const writerData = writerDbc.load(writerContent);
  try {
    expect(writerData.messages).toEqual(data.messages);
    done();
  } finally {
    fs.unlinkSync(testFile);
  }
});

test('DBC_template.dbc: Correct Signals Written to File', (done) => {
  const testFile = 'src/__tests__/testFiles/test.dbc';
  // Expected
  const dbc = new Dbc();
  const content = dbcReader('src/__tests__/testFiles/DBC_template.dbc');
  const data = dbc.load(content);
  const writer = new Writer();
  const dbcString = writer.constructFile(data);
  dbcWriter(testFile,dbcString);

  // Actual
  const writerDbc = new Dbc();
  const writerContent = dbcReader(testFile);
  const writerData = writerDbc.load(writerContent);
  try {
    for (const [name, message] of writerData.messages) {
      expect(writerData.messages.get(name)?.signals).toEqual(data.messages.get(name)?.signals);
    }
    done();
  } finally {
    fs.unlinkSync(testFile);
  }
});

test('DBC_template.dbc: Correct Table Values Written to File', (done) => {
  const testFile = 'src/__tests__/testFiles/test.dbc';
  // Expected
  const dbc = new Dbc();
  const content = dbcReader('src/__tests__/testFiles/DBC_template.dbc');
  const data = dbc.load(content);
  const writer = new Writer();
  const dbcString = writer.constructFile(data);
  dbcWriter(testFile,dbcString);

  // Actual
  const writerDbc = new Dbc();
  const writerContent = dbcReader(testFile);
  const writerData = writerDbc.load(writerContent);
  try {
    expect(writerData.valueTables).toEqual(data.valueTables);
    done();
  } finally {
    fs.unlinkSync(testFile);
  }
});

test('DBC_template.dbc: Correct Signals Tables Written to File', (done) => {
  const testFile = 'src/__tests__/testFiles/test.dbc';
  // Expected
  const dbc = new Dbc();
  const content = dbcReader('src/__tests__/testFiles/DBC_template.dbc');
  const data = dbc.load(content);
  const writer = new Writer();
  const dbcString = writer.constructFile(data);
  dbcWriter(testFile,dbcString);

  // Actual
  const writerDbc = new Dbc();
  const writerContent = dbcReader(testFile);
  const writerData = writerDbc.load(writerContent);
  try {
    for (const [name, message] of writerData.messages) {
      const writerSignals = writerData.messages.get(name)?.signals;
      const dataSignals = data.messages.get(name)?.signals;
      if (dataSignals) {
        for (const [signalName, signal] of dataSignals) {
          expect(signal.valueTable).toEqual(writerSignals?.get(signalName)?.valueTable);
        }
      } else {
        fail('No signals in test dbc file.');
      }
    }
    done();
  } finally {
    fs.unlinkSync(testFile);
  }
});
