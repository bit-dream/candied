/**
 * Main file
 * Simply exports the main uility class so that it can be referenced when imported via an NPM package
 */
import Dbc from './dbc/dbc';
import Can from './can/can';

export default Dbc;

if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = Object.assign(module.exports.default, module.exports);
}

let dbc = new Dbc();

dbc.load('src/__tests__/testFiles/tesla_can.dbc')
.then(data => {
  let msg = dbc.getMessageById(792);
  let sig = dbc.getSignalByName('BOOT_STATE','GTW_carState');
  console.log(sig);
  const canBus = new Can(data);
  let frame = canBus.createFrame(309,[13,100,1,10,240]);
  let bndMsg = canBus.decode(frame);
  console.log(bndMsg);

})
