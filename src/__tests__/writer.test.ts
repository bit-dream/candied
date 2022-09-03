import Dbc from '../dbc/dbc';
import { MessageDoesNotExist } from '../dbc/errors';
import Writer from '../dbc/writer';

test('DBC_template.dbc: Correct Messages', () => {
  const dbc = new Dbc();
  dbc.load('src/__tests__/testFiles/DBC_template.dbc').then((data) => {
    /* To test that we wrote the messages correctly, we will
    first parse the original file, write the parsed contents of the file
    to a new file and reparse the test file. Messages in the original file
    should match the parsed test file */
    const writer = new Writer('src/__tests__/testFiles/test.dbc');
    writer.constructFile(data);
    const writerDbc = new Dbc();
    dbc.load('test.dbc').then(writerData => {
      expect(data.messages).toEqual(writerData.messages);
    })
  });
});