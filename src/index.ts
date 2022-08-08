import Dbc from './dbc/dbc';

let dbcData;
const dbc = new Dbc('/Users/headquarters/Documents/Code/can-dbc/src/__tests__/testFiles/DBC_template.dbc');
dbc.load().then((data) => {
  dbcData = data;
});
