/**
 * Main file
 * Simply exports the main uility class so that it can be referenced when imported via an NPM package
 */
import Dbc from './dbc/dbc';
import Can from './can/can';
import { parse, Choice } from './parser/parser'

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

export default Dbc;

if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = Object.assign(module.exports.default, module.exports);
}
export { Can };

const dbc = new Dbc();
const [data, err] = dbc.loadSync('/Users/headquarters/Documents/Code/can-dbc/src/__tests__/testFiles/DBC_template.dbc',
false);
console.log(data)
console.log(err)