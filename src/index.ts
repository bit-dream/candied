/**
 * Main file
 * Simply exports the main uility class so that it can be referenced when imported via an NPM package
 */
import Dbc from './dbc/dbc';
import Can from './can/can';
import { parse } from './parser/parser'

export default Dbc;

if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = Object.assign(module.exports.default, module.exports);
}
export { Can };

const ret = parse("BO_ 4321 CANMultiplexed: 2 Node0");
const ret2 = parse("BU_: hello CANMultiplexed ;");
const ret3 = parse("BU_: ;");
const ret4 = parse("BU_:");
const ret5 = parse('SG_ Multiplexer M : 0|8@1+ (1,0) [0|0] "%" Node1')
const ret6 = parse('SG_ Multiplexer m2 : 0|8@1+ (1,0) [0|0] "" Node1')
const ret7 = parse('SG_ Multiplexer : 0|8@1+ (1,0) [0|0] "" Node1 Node2')
console.log(ret5,ret6,ret7);