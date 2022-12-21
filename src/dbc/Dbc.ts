import * as fs from 'fs';
import * as readline from 'readline';
import DbcParser from '../parser/dbcParser';
import Writer from './Writer';
import { IncorrectFileExtension, MessageDoesNotExist, SignalDoesNotExist } from './Errors';
import { computeDataType, DataType, EndianType } from '../shared/DataTypes';
import { validateFileExtension } from '../shared/FileHandlers';

/**
 * Creates a DBC instance that allows for parsing/loading of an existing DBC file
 * or write data to a new DBC file.
 *
 * If loading data from an existing file, simply call:
 * const dbc = new Dbc();
 * dbc.load('path/to/my/dbcFile.dbc')
 *
 * load() loads the dbc data async., so to pull the data from the class instance
 * you will either need to wrap the call in an async function or call .then(data)
 * ex. dbc.load('path/to/my/dbcFile.dbc').then( data => DO SOMETHING WITH DATA HERE )
 *
 * By default, when a new Dbc() instance is created, the encapulsated data will be empty.
 * If you are wanting to create fresh data you can call createMessage or createSignal to
 * create messages and signals, respectively.
 * Calls to createMessage and createSignal do not by default add the messages to the data,
 * you will need to make subsequent calls to addMessage or addSignal to add the data
 * to the class.
 *
 * To write data to a dbc file, you can call write() function.
 * write() expects a path to the dbc file
 *
 */
class Dbc {
  data: DbcData;
  errors: Map<number, SyntaxError[]> = new Map();

  constructor() {
    this.data = this.initDbcDataObj();
  }

  /**
   * Adds a version number to dbc data
   */
  set version(version: string) {
    this.data.version = version;
  }

  /**
   * Adds a short description for the DBC data
   */
  set description(description: string) {
    this.data.description = description;
  }

  /**
   *
   * Creates a Message instance that can later be added using addMessage()
   * or using the attached method .add()
   *
   * Ex.
   * let msg = dbc.createMessage('MessageName',100,8);
   * msg.add(); or dbc.addMessage(msg);
   *
   * @param name Name of CAN message
   * @param id ID of CAN message
   * @param dlc Data Length Code (data length) of CAN message
   * @param options Optional attributes that can be used when creating a message: signals, attributes, signalGroups,
   * sendingNode, and description
   * @returns Message
   */
  createMessage(name: string, id: number, dlc: number, options?: AdditionalMessageOptions): Message {
    // TODO: Check that ID does not exceed max range
    let signals: Signals;
    let attributes: Attributes;
    let signalGroups: SignalGroups;
    let sendingNode: string | null;
    let description: string | null;
    options && options.signals ? (signals = options.signals) : (signals = new Map());
    options && options.attributes ? (attributes = options.attributes) : (attributes = new Map());
    options && options.signalGroups ? (signalGroups = options.signalGroups) : (signalGroups = new Map());
    options && options.description ? (description = options.description) : (description = null);
    options && options.sendingNode ? (sendingNode = options.sendingNode) : (sendingNode = null);

    const message: Message = {
      name,
      id,
      dlc,
      sendingNode,
      signals,
      description,
      attributes,
      signalGroups,
      add: () => {
        this.addMessage(message);
        return message;
      },
      addSignal: (signalName, startBit, length: number, additionalOptions?: AdditionalMessageOptions) => {
        const signal = this.createSignal(signalName, startBit, length, additionalOptions);
        this.addSignal(message.name, signal);
        return message;
      },
    };
    return message;
  }

  /**
   *
   * Adds/appends message to existing message list
   *
   * @param message Message object to be added
   */
  addMessage(message: Message | Message[]) {
    const errorOnDuplicate = (name: string) => {
      if (this.data.messages.has(name)) {
        throw new Error(`Can not add message ${name} as ${name} already exists. Unique message names are required.`);
      }
    };

    if (Array.isArray(message)) {
      message.forEach((msg) => {
        errorOnDuplicate(msg.name);
        this.data.messages.set(msg.name, msg);
      });
    } else {
      errorOnDuplicate(message.name);
      this.data.messages.set(message.name, message);
    }
  }

  removeMessage(messageName: string) {
    this.data.messages.delete(messageName);
  }

  createSignal(name: string, startBit: number, length: number, options?: AdditionalSignalOptions) {
    let min: number;
    let max: number;
    let factor: number;
    let offset: number;
    let isFloat: boolean;
    let signed: boolean;
    let endian: EndianType;
    let dataType: DataType;
    let unit: string;
    let description: string | null;
    let multiplex: string | null;
    let receivingNodes: string[];
    let valueTable: ValueTable | null;
    let attributes: Attributes;

    options && options.signed ? (signed = options.signed) : (signed = false);
    options && options.endian ? (endian = options.endian) : (endian = 'Intel');
    options && options.min ? (min = options.min) : (min = 0);
    options && options.max ? (max = options.max) : (max = 0);
    options && options.offset ? (offset = options.offset) : (offset = 0);
    options && options.factor ? (factor = options.factor) : (factor = 1);
    options && options.isFloat ? (isFloat = options.isFloat) : (isFloat = false);
    options && options.unit ? (unit = options.unit) : (unit = '');
    options && options.description ? (description = options.description) : (description = null);
    options && options.multiplex ? (multiplex = options.multiplex) : (multiplex = null);
    options && options.receivingNodes ? (receivingNodes = options.receivingNodes) : (receivingNodes = []);
    options && options.valueTable ? (valueTable = options.valueTable) : (valueTable = null);
    options && options.attributes ? (attributes = options.attributes) : (attributes = new Map());
    dataType = computeDataType(length, signed, isFloat);

    const signal: Signal = {
      name,
      multiplex,
      startBit,
      length,
      endian,
      signed,
      factor,
      offset,
      min,
      max,
      unit,
      receivingNodes,
      description,
      valueTable,
      attributes,
      dataType,
    };
    return signal;
  }

  removeSignal(signalName: string, messageName: string) {
    const msg = this.getMessageByName(messageName);
    msg?.signals.delete(signalName);
  }

  /**
   *
   * Adds a Signal object to a specified Message
   *
   * @param messageName Name of the message the signal will be added to
   * @param signal Signal object to be added to the specified message
   */
  addSignal(messageName: string, signal: Signal | Signal[]) {
    const message = this.data.messages.get(messageName);
    if (message) {
      if (Array.isArray(signal)) {
        signal.forEach((sig) => {
          message.signals.set(sig.name, sig);
        });
      } else {
        message.signals.set(signal.name, signal);
      }
    } else {
      throw new MessageDoesNotExist(`No message with name ${messageName} exists in the database.`);
    }
  }

  /**
   *
   * Returns a message with the corresponding CAN ID. If message does not exist
   * a MessageDoesNotExist error will be thrown.
   *
   * @param id The CAN ID of the message wanting to be found
   * @returns Message
   * @throws MessageDoesNotExist
   */
  getMessageById(id: number): Message {
    const messages = this.data.messages;
    for (const [name, message] of messages) {
      if (message.id === id) {
        return message;
      }
    }
    throw new MessageDoesNotExist(`No message with id ${id} exists in the database.`);
  }

  /**
   *
   * Finds a specific message within the DBC file data by name
   *
   * @param name string
   * @returns Message
   * @error MessageDoesNotExist
   */
  getMessageByName(name: string) {
    try {
      const msg = this.data.messages.get(name);
      return msg;
    } catch (e) {
      throw new MessageDoesNotExist(`No message with name ${name} exists in the database.`);
    }
  }

  /**
   *
   * Returns a signal object located in a specific CAN message by name
   *
   * @param name string
   * @param messageName string
   * @returns Signal
   * @error SignalDoesNotExist
   */
  getSignalByName(name: string, messageName: string) {
    const msg = this.getMessageByName(messageName);
    const signals = msg?.signals;
    if (signals) {
      for (const [signal, signalObj] of signals) {
        if (signal === name) {
          return signalObj;
        }
      }
    } else {
      throw new SignalDoesNotExist(`Signal could not be found in ${messageName}, because the
      signal list for that message is empty.`);
    }
    throw new SignalDoesNotExist(`Could not find ${name} in signal list.`);
  }

  /**
   *
   * @param file string
   * @returns Promise<DbcData>
   */
  async load(file: string, throwOnError: boolean = false): Promise<DbcData> {
    validateFileExtension(file, '.dbc');
    const fileStream = fs.createReadStream(file);

    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let data = this.initDbcDataObj();

    let lineNum = 1;
    const errMap = new Map();

    for await (const line of rl) {
      const parser = new DbcParser(line);
      const parseErrors = parser.parseResult.errs;
      if (parseErrors.length === 0) {
        data = parser.updateData(data);
      } else {
        if (throwOnError) {
          throw new Error(`A syntax error occured on line ${lineNum} - Reason: ${parseErrors}`);
        }
        errMap.set(lineNum, parseErrors);
      }
      lineNum++;
    }

    // Set parsing errors
    this.errors = errMap;

    // Add table data to class instance for future referencing
    this.data = data;
    return data;
  }

  /**
   * Loads a DBC file syncrhonously, as opposed to the default method 'load', which is
   * a non-blocking/async call whos promise must be caught for the return data to be used.
   *
   * @param file Full file path to the dbc file, including extension
   * @returns DbcData Data contained in the dbc file
   */
  loadSync(file: string, throwOnError: boolean = false): DbcData {
    validateFileExtension(file, '.dbc');

    let data = this.initDbcDataObj();

    const fileContents = fs.readFileSync(file, { encoding: 'ascii' });

    let lineNum = 1;
    const errMap = new Map();

    const lines = fileContents.split('\n');
    lines.forEach((line) => {
      const parser = new DbcParser(line);
      const parseErrors = parser.parseResult.errs;
      if (parseErrors.length === 0) {
        data = parser.updateData(data);
      } else {
        if (throwOnError) {
          throw new Error(`A syntax error occured on line ${lineNum} - Reason: ${parseErrors}`);
        }
        errMap.set(lineNum, parseErrors);
      }
      lineNum++;
    });

    // Set parsing errors
    this.errors = errMap;

    // Add table data to class instance for future referencing
    this.data = data;
    return data;
  }

  /**
   *
   * Writes the encapsulated data of a Dbc class instance to a dbc file
   *
   * @param filePath Path to the file/dbc to be written to. If it does not exist at the path, the file
   * will automatically be created.
   */
  write(filePath: string) {
    validateFileExtension(filePath, '.dbc');
    const writer = new Writer(filePath);
    writer.constructFile(this.data);
  }

  /**
   *
   * Transforms the internal DBC data from class instance into a JSON object/string
   *
   * @param pretty Determines if JSON output should be formatted. Defaults to true.
   * @returns JSON representation of loaded DBC data
   */
  toJson(pretty = true) {
    const replacer = (key: any, value: any) => {
      if (value instanceof Map) {
        if (key === 'valueTable' || key === 'valueTables') {
          return Object.fromEntries(value.entries());
        }
        return Array.from(value.values()); // or with spread: value: [...value]
      } else {
        return value;
      }
    };

    let indent = 0;
    if (pretty) {
      indent = 2;
    }
    const json = JSON.stringify(this.data, replacer, indent);
    return json;
  }

  initDbcDataObj(): DbcData {
    return {
      version: null,
      messages: new Map(),
      description: null,
      busSpeed: null,
      nodes: new Map(),
      valueTables: new Map(),
      attributes: new Map(),
      newSymbols: [],
      environmentVariables: new Map(),
      networkBridges: new Map(),
    };
  }
}
export default Dbc;

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
  receivingNodes?: string[];
  valueTable?: ValueTable;
  attributes?: Attributes;
};
export type Signal = {
  name: string;
  multiplex: string | null;
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
};

export type SignalGroups = Map<string, SignalGroup>;
export type SignalGroup = {
  name: string;
  id: number;
  groupId: number;
  signals: string[];
};

export type AdditionalMessageOptions = {
  signals?: Signals;
  attributes?: Attributes;
  signalGroups?: SignalGroups;
  sendingNode?: string;
  description?: string;
};
export type Message = {
  name: string;
  id: number;
  dlc: number;
  sendingNode: string | null;
  signals: Map<string, Signal>;
  description: string | null;
  attributes: Attributes;
  signalGroups: SignalGroups;
  add: () => Message;
  addSignal: (name: string, startBit: number, length: number, options?: AdditionalSignalOptions) => Message;
};

export type EnvType = 'Integer' | 'Float' | 'String';

export type AccessType = 'Unrestricted' | 'Read' | 'Write' | 'ReadWrite';

export type EnvironmentVariable = {
  name: string;
  type: EnvType;
  min: number;
  max: number;
  initalValue: number;
  evId: number;
  accessType: AccessType;
  accessNode: string;
  attributes: Attributes;
  valueTable: ValueTable | null;
  description: string | null;
  dataBytesLength: number | null;
  unit: string;
};

export type Node = {
  name: string;
  description: string | null;
  attributes: Attributes;
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

export type AttributeOptions = {
  value?: string;
  defaultValue?: string;
  options?: string[];
  min?: number;
  max?: number;
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
