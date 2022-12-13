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
export { Can };

const dbc = new Dbc();
const data = dbc.loadSync('src/__tests__/testFiles/DBC_template.dbc');
dbc.write('src/TEST.dbc')
console.log(data)