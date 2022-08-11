import Dbc from './dbc/dbc';

let dbcData;
const dbc = new Dbc();
dbc.load('/Users/headquarters/Documents/Code/can-dbc/src/__tests__/testFiles/tesla_can.dbc').then((data) => {
  console.log(data.messages.get('DAS_lanes'))
});
