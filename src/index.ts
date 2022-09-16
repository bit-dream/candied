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

export {Can};

let dbc = new Dbc();

dbc.load('src/__tests__/testFiles/tesla_can.dbc')
.then(data => {
  let msg = dbc.getMessageById(264);
  console.log(msg);
  const canBus = new Can(data);
  let frame = canBus.createFrame(264,[13,100,140,10,240, 100, 80, 244]);
  let bndMsg = canBus.decode(frame);
  console.log(bndMsg);

})
