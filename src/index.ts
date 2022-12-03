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
const ret8 = parse('VAL_TABLE_ DI_mode 2 "DI_MODE_DYNO" 1 "DI_MODE_DRIVE" 0 "DI_MODE_UNDEF" ;')
const ret9 = parse('VAL_TABLE_ DI_limpReason 24 "DI_LIMP_NUMREASONS" 23 "DI_LIMP_CAPACITOR_OVERTEMP" 22 "DI_LIMP_GTW_MIA" 21 "DI_LIMP_TRQCMD_VALIDITY_UNKNOWN" 20 "DI_LIMP_DI_MIA" 19 "DI_LIMP_CONFIG_MISMATCH" 18 "DI_LIMP_HEATSINK_TEMP" 17 "DI_LIMP_PMREQUEST" 16 "DI_LIMP_PMHEARTBEAT" 15 "DI_LIMP_TRQ_CROSS_CHECK" 14 "DI_LIMP_EXTERNAL_COMMAND" 13 "DI_LIMP_WRONG_CS_CALIBRATION" 12 "DI_LIMP_STATOR_TEMP" 11 "DI_LIMP_DELTAT_TOO_NEGATIVE" 10 "DI_LIMP_DELTAT_TOO_POSITIVE" 9 "DI_LIMP_AMBIENT_TEMP" 8 "DI_LIMP_OUTLET_TEMP" 7 "DI_LIMP_LOW_FLOW" 6 "DI_LIMP_BMS_MIA" 5 "DI_LIMP_12V_SUPPLY_UNDERVOLTAGE" 4 "DI_LIMP_NO_FLUID" 3 "DI_LIMP_NO_FUNC_HEATSINK_SENSOR" 2 "DI_LIMP_NO_FUNC_STATORT_SENSOR" 1 "DI_LIMP_BUSV_SENSOR_IRRATIONAL" 0 "DI_LIMP_PHASE_IMBALANCE" ;')
const ret10 = parse('VAL_TABLE_ StW_AnglHP_Spd 16383 "SNA" ;')
console.log(ret8,ret9,ret10);