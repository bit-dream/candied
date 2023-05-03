import {DataType, EndianType} from "../shared/DataTypes";

export type SignalGroups = Map<string, SignalGroup>;
export type SignalGroup = {
    name: string;
    id: number;
    groupId: number;
    signals: string[];
};
export type MultiplexSignals = Map<string, MultiplexSignal>;
export type Signals = Map<string, Signal>;
export type AdditionalSignalOptions = {
    signed?: boolean;
    endian?: EndianType;
    min?: number;
    max?: number;
    factor?: number;
    offset?: number;
    isFloat?: boolean;
    unit?: string;
    description?: string;
    multiplex?: string;
    multiplexer?: boolean;
    receivingNodes?: string[];
    valueTable?: ValueTable;
    attributes?: Attributes;
};
export type Signal = {
    name: string;
    multiplex: string | null;
    multiplexer: boolean;
    startBit: number;
    length: number;
    endian: EndianType;
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
    dataType: DataType | undefined;
    add: (messageName: string) => Signal;
    updateDescription: (content: string) => Signal;
    addAttribute: (
        attrName: string,
        messageId: number,
        type: AttributeDataType,
        attrProps?: RequiredAttributeProps,
        attrOptions?: AdditionalAttributeObjects,
    ) => Signal;
    isMultiplex: () => boolean;
};
export type TxMessages = string[];
export type CanId = number;
export type NetworkBridges = Map<CanId, TxMessages>;
export type DbcData = {
    version: string | null;
    messages: Map<string, Message>;
    description: string | null;
    busSpeed: number | null;
    nodes: Map<string, Node>;
    valueTables: Map<string, ValueTable> | null;
    attributes: Attributes;
    newSymbols: string[];
    environmentVariables: Map<string, EnvironmentVariable>;
    networkBridges: NetworkBridges;
};
export type ValueTable = Map<number, string>;
export type RequiredAttributeProps = {
    type?: AttributeType;
    min?: number;
    max?: number;
    enumMembers?: string[];
};
export type AdditionalAttributeObjects = {
    value?: string;
    defaultValue?: string;
};
export type Attributes = Map<string, Attribute>;
export type AttributeType = 'Global' | 'Message' | 'Signal' | 'Node' | 'EnvironmentVariable';
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
export type MultiplexSignal = {
    signal: Signal;
    children: Map<number, MultiplexSignal[]>;
};
export type AdditionalMessageOptions = {
    signals?: Signals;
    baseSignals?: Signals;
    multiplexSignals?: MultiplexSignals;
    attributes?: Attributes;
    signalGroups?: SignalGroups;
    sendingNode?: string;
    description?: string;
};
export type Message = {
    name: string;
    id: number;
    extended: boolean;
    dlc: number;
    sendingNode: string | null;
    signals: Map<string, Signal>;
    baseSignals: Map<string, Signal>;
    multiplexSignals: Map<string, MultiplexSignal>;
    description: string | null;
    attributes: Attributes;
    signalGroups: SignalGroups;
    add: () => Message;
    addSignal: (name: string, startBit: number, length: number, options?: AdditionalSignalOptions) => Message;
    updateDescription: (content: string) => Message;
    updateNode: (node: string) => Message;
    addAttribute: (
        attrName: string,
        type: AttributeDataType,
        attrProps?: RequiredAttributeProps,
        attrOptions?: AdditionalAttributeObjects,
    ) => Message;
};
export type SignalMultiplexValue = {
    id: number;
    name: string;
    switchName: string;
    value_ranges: string[][];
};
export type EnvType = 'Integer' | 'Float' | 'String';
export type AccessType = 'Unrestricted' | 'Read' | 'Write' | 'ReadWrite';
export type EnvironmentVariable = {
    name: string;
    type: EnvType;
    min: number;
    max: number;
    initialValue: number;
    evId: number;
    accessType: AccessType;
    accessNode: string;
    attributes: Attributes;
    valueTable: ValueTable | null;
    description: string | null;
    dataBytesLength: number | null;
    unit: string;
};
/**
 *
 * Global/generic types for library
 */
export type Node = {
    name: string;
    description: string | null;
    attributes: Attributes;
    add: () => Node;
    updateDescription: (content: string) => Node;
    addAttribute: (
        attrName: string,
        type: AttributeDataType,
        attrProps?: RequiredAttributeProps,
        attrOptions?: AdditionalAttributeObjects,
    ) => Node;
};