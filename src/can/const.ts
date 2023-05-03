/*
 * Controller Area Network Identifier structure
 *
 * bit 0-28      : CAN identifier (11/29 bit)
 * bit 29        : error frame flag (0 = data frame, 1 = error frame)
 * bit 30        : remote transmission request flag (1 = rtr frame)
 * bit 31        : frame format flag (0 = standard 11 bit, 1 = extended 29 bit)
 */

export const CAN_EFF_FLAG = 0x80000000;
export const CAN_EFF_MASK = 0x1fffffff;
export const CAN_SFF_MASK = 0x000007ff;
export const CAN_SFF_ID_BITS = 11;
export const CAN_EFF_ID_BITS = 29;
