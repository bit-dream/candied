/**
 * Main file
 * Simply exports the main uility class so that it can be referenced when imported via an NPM package
 */
import Dbc from './dbc/Dbc';
import Can from './can/Can';
import dbcReader from "./filesystem/DbcReader";

export default Dbc;

if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = Object.assign(module.exports.default, module.exports);
}
export { Can };

const content = dbcReader('/Users/headquarters/Documents/Code/can-dbc/src/__tests__/testFiles/DBC_template_v2.dbc')
const dbc = new Dbc();
dbc.load(content);
const dbcStr = dbc.write();
console.log(dbcStr);