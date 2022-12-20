/**
 * Main file
 * Simply exports the main uility class so that it can be referenced when imported via an NPM package
 */
import Dbc from './dbc/Dbc';
import Can from './can/Can';

export default Dbc;

if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = Object.assign(module.exports.default, module.exports);
}
export { Can };

const dbc = new Dbc();

const msg1 = dbc.createMessage('TestMessage', 100, 8);
console.log(dbc.data);
msg1.add();
console.log(dbc.data);

const msg2 = dbc.createMessage('TestMessage2', 200, 10).add();
console.log(dbc.data);
