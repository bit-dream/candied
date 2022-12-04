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
  attributes: Attributes | null;
};

export type Message = {
  name: string;
  id: number;
  dlc: number;
  sendingNode: string | null;
  signals: Map<string, Signal>;
  description: string | null;
  attributes: Attributes | null;
};

export type Node = {
  name: string;
  description: string | null;
  attributes: Attributes | null;
}

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
  nodes: Map<string,Node>;
  valueTables: Map<string, ValueTable> | null;
  attributes: Attributes | null;
  newSymbols: string[];
};

export type ValueTable = Map<number, string>;

export type MessageRegex = {
  messageName: string;
  id: string;
  dlc: string;
  sendingNode: string;
};

export type SignalRegex = {
  name: string;
  plex: string;
  startBit: string;
  length: string;
  endian: string;
  signed: string;
  factor: string;
  offset: string;
  min: string;
  max: string;
  unit: string;
  receivingNodes: string;
};

export type VersionRegex = {
  version: string;
};

export type CanConfigRegex = {
  speed: string;
};

export type CanNodesRegex = {
  nodes: string;
};

export type DefinitionRegex = {
  definition: string;
};

export type CanFrame = {
  id: number;
  dlc: number;
  extended: boolean;
  payload: Uint8Array;
};

export type Attributes = Map<string,Attribute>;

export type Attribute = {
  name: string;
  dataType: string;
  value: string;
  options: string[];
};

export interface Config {
  defaultEndianness: string;
  overwriteFile: boolean;
  newFileOnWrite: boolean;
  overwriteMessages: boolean;
  overwriteSignals: boolean;
}

export type EndianType = 'Intel' | 'Motorola';
