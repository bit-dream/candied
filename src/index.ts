import Dbc from './dbc/dbc';
import { MessageDoesNotExist } from '../src/dbc/errors';

/* Take a look at signal table parsing for DBC_template.dbc. doesn't
seem to be pulling out correctly, but does for the tesla dbc file */
let dbcData;
const dbc = new Dbc();
dbc.load('/Users/headquarters/Documents/Code/can-dbc/src/__tests__/testFiles/tesla_can.dbc').then((data) => {
  console.log(data);
  dbc.write('hello.dbc');
});
