import Dbc from './dbc/dbc';

let dbcData;
const dbc = new Dbc();
dbc.load('/Users/headquarters/Documents/Code/can-dbc/src/__tests__/testFiles/DBC_template.dbc')
.then((data) => {
  dbcData = data;
  console.log(dbcData)
});

const dbc2 = new Dbc();
console.log(dbc2.data)
dbc2.addMessage({
  name: 'test',
  id: 10,
  dlc: 4,
  signals: new Map(),
  sendingNode: 'test',
  description: 'this is a test'
})
dbc2.version = '1.0';
dbc2.busConfiguration = 250;
dbc2.canNodes = ['Node1', 'Node2'];
dbc2.description = 'This is just a simple test'
console.log(dbc2.data)