/**
 * Main file
 * Simply exports the main uility class so that it can be referenced when imported via an NPM package
 */
import Dbc from './dbc/dbc';

export default Dbc;

if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = Object.assign(module.exports.default, module.exports);
}

import Can from './can/can';

let can = new Can();

let frame = can.createFrame(10000,[300,100,1,10]);

let data = [255,100,1,10,240,101,200,150];

console.log(can.decArr2bin(data));
let val = can.getValue(data,44,10,'Motorola',true);
console.log(val)