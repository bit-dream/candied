import Dbc from '../dbc/Dbc';
import Writer from '../dbc/Writer';
import * as fs from 'fs';

test('DBC_template.dbc: Correct Messages Written to File', (done) => {
  const testFile = 'src/__tests__/testFiles/test.dbc';
  const dbc = new Dbc();
  dbc.load('src/__tests__/testFiles/DBC_template.dbc').then((data) => {
    /* To test that we wrote the messages correctly, we will
    first parse the original file, write the parsed contents of the file
    to a new file and reparse the test file. Messages in the original file
    should match the parsed test file */
    const writer = new Writer(testFile);
    writer.constructFile(data);

    const writerDbc = new Dbc();
    writerDbc.load(testFile).then((writerData) => {
      try {
        expect(writerData.messages).toEqual(data.messages);
        done();
      } finally {
        fs.unlinkSync(testFile);
      }
    });
  });
});

test('DBC_template.dbc: Correct Signals Written to File', (done) => {
  const testFile = 'src/__tests__/testFiles/test.dbc';
  const dbc = new Dbc();
  dbc.load('src/__tests__/testFiles/DBC_template.dbc').then((data) => {
    /* To test that we wrote the messages correctly, we will
    first parse the original file, write the parsed contents of the file
    to a new file and reparse the test file. Messages in the original file
    should match the parsed test file */
    const writer = new Writer(testFile);
    writer.constructFile(data);

    const writerDbc = new Dbc();
    writerDbc.load(testFile).then((writerData) => {
      try {
        for (const [name, message] of writerData.messages) {
          expect(writerData.messages.get(name)?.signals).toEqual(data.messages.get(name)?.signals);
        }
        done();
      } finally {
        fs.unlinkSync(testFile);
      }
    });
  });
});

test('DBC_template.dbc: Correct Table Values Written to File', (done) => {
  const testFile = 'src/__tests__/testFiles/test.dbc';
  const dbc = new Dbc();
  dbc.load('src/__tests__/testFiles/DBC_template.dbc').then((data) => {
    /* To test that we wrote the messages correctly, we will
    first parse the original file, write the parsed contents of the file
    to a new file and reparse the test file. Messages in the original file
    should match the parsed test file */
    const writer = new Writer(testFile);
    writer.constructFile(data);

    const writerDbc = new Dbc();
    writerDbc.load(testFile).then((writerData) => {
      try {
        expect(writerData.valueTables).toEqual(data.valueTables);
        done();
      } finally {
        fs.unlinkSync(testFile);
      }
    });
  });
});

test('DBC_template.dbc: Correct Signals Tables Written to File', (done) => {
  const testFile = 'src/__tests__/testFiles/test.dbc';
  const dbc = new Dbc();
  dbc.load('src/__tests__/testFiles/DBC_template.dbc').then((data) => {
    /* To test that we wrote the messages correctly, we will
    first parse the original file, write the parsed contents of the file
    to a new file and reparse the test file. Messages in the original file
    should match the parsed test file */
    const writer = new Writer(testFile);
    writer.constructFile(data);

    const writerDbc = new Dbc();
    writerDbc.load(testFile).then((writerData) => {
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
  });
});
