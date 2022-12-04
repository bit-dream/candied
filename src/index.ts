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
// TODO: strip starting and ending white spaces from parsed comments
const dbc = new Dbc();
const file = '/Users/headquarters/Documents/Code/can-dbc/src/__tests__/testFiles/tesla_can.dbc';
dbc.load(file).then((data) => {
  console.log(data);
});
