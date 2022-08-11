import Dbc from './dbc/dbc';
import { MessageDoesNotExist } from '../src/dbc/errors';

let dbcData;
const dbc = new Dbc();
dbc.load('/Users/headquarters/Documents/Code/can-dbc/src/__tests__/testFiles/DBC_template.dbc').then((data) => {
  let msg = dbc.getMessageById(1234);
  console.log(msg);

  try {
    let msg2 = dbc.getMessageById(1000);
  } catch (MessageDoesNotExist) {
    console.log('hello');
  }
});
