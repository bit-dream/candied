/**
 *
 * Global/generic types for library
 */

export type Signal = {
  name: string;
  multiplex: string | null;
  startBit: number;
  length: number;
  endianness: EndianType;
  signed: boolean;
  factor: number;
  offset: number;
  min: number;
  max: number;
  unit: string;
  receivingNodes: string[];
  description: string | null;
  valueTable: ValueTable | null;
  attributes: Attributes;
};

export type Message = {
  name: string;
  id: number;
  dlc: number;
  sendingNode: string | null;
  signals: Map<string, Signal>;
  description: string | null;
  attributes: Attributes;
};

export type Node = {
  name: string;
  description: string | null;
  attributes: Attributes;
};

export type Tokens = {
  [key: string]: Token;
};

export type Token = {
  name: string;
  dataFormat: RegExp;
};

export type DbcData = {
  version: string | null;
  messages: Map<string, Message>;
  description: string | null;
  busSpeed: number | null;
  nodes: Map<string, Node>;
  valueTables: Map<string, ValueTable> | null;
  attributes: Attributes;
  newSymbols: string[];
};

export type ValueTable = Map<number, string>;

export type CanFrame = {
  id: number;
  dlc: number;
  extended: boolean;
  payload: Uint8Array;
};

export type Attributes = Map<string, Attribute>;
export type AttributeType = 'Global' | 'Message' | 'Signal' | 'Node';
export type AttributeDataType = 'FLOAT' | 'STRING' | 'ENUM' | 'INT' | 'HEX';
export type Attribute = {
  name: string;
  type: AttributeType;
  dataType: AttributeDataType;
  value: string | null;
  defaultValue: string | null;
  options: string[] | null;
  min: number | null;
  max: number | null;
};

export interface Config {
  defaultEndianness: string;
  overwriteFile: boolean;
  newFileOnWrite: boolean;
  overwriteMessages: boolean;
  overwriteSignals: boolean;
}

export type EndianType = 'Intel' | 'Motorola';
