/**
 * Main file
 * Simply exports the main uility class so that it can be referenced when imported via an NPM package
 */
import Dbc from './dbc/dbc';
import Can from './can/can';
import { parse, Choice } from './parser/parser';

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

export default Dbc;

if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = Object.assign(module.exports.default, module.exports);
}
export { Can };

// TODO: Clear out starting and ending spaces for attribute option parsing
// TODO: when parsed node list is empty, it's generating a map with a key of '' in the data
// TODO: Perform cleanup after parse to remove non-global attributes from main attributes map
const dbc = new Dbc();
const file = '/Users/headquarters/Documents/Code/can-dbc/src/__tests__/testFiles/SimpleDBC.dbc';
const writeFile = '/Users/headquarters/Documents/Code/can-dbc/test.dbc';
const data = dbc.loadSync(file);
dbc.write(writeFile)

let a = 2;

console.log(data)
console.log(dbc.errors)
