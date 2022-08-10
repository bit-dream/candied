/**
 * 
 * Global/generic types for library
 */

export interface Signal {
    name: string;
    multiplex: string;
    startBit: number;
    length: number;
    endianness: string;
    signed: boolean;
    factor: number;
    offset: number;
    min: number;
    max: number;
    unit: string;
    receivingNodes: string[];
    description: string | null;
};
  
export interface Message {
    name: string;
    id: number;
    dlc: number;
    sendingNode: string;
    signals: Map<string, Signal>;
    description: string | null;
};

export type Tokens = {
    [key:string]: Token
  }

export type Token = {
    name: string;
    dataFormat: RegExp;
};

export type MessageRegex = {
    messageName: string;
    id: string;
    dlc: string;
    sendingNode: string;
}

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
}

export type VersionRegex = {
    version: string;
}

export type CanConfigRegex = {
    speed: string;
}

export type CanNodesRegex = {
    nodes: string;
}