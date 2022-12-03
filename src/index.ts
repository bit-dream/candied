/**
 * Main file
 * Simply exports the main uility class so that it can be referenced when imported via an NPM package
 */
import Dbc from './dbc/dbc';
import Can from './can/can';
import { parse } from './parser/parser'

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

export default Dbc;

if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = Object.assign(module.exports.default, module.exports);
}
export { Can };

const fileContents = fs.readFileSync('/Users/headquarters/Documents/Code/can-dbc/src/__tests__/testFiles/DBC_template.dbc', { encoding: 'ascii' });
const lines = fileContents.split('\n');
lines.forEach((line) => {
  let ret = parse(line);
  console.log(ret)
});
