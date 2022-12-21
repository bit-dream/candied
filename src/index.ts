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

dbc
  .createMessage('TestMessage', 100, 8)
  .add()
  .addSignal('TestSignal1', 0, 8, { signed: true })
  .addSignal('TestSignal2', 10, 10)
  .addSignal('TestSignal3', 20, 32, { isFloat: true, max: 100 })
  .addSignal('TestSignal4', 20, 10, { unit: '%', max: 20 });

console.log(dbc.data.messages.get('TestMessage')?.signals);
