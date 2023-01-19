import DbcParser from '../parser/dbcParser';
import Writer from './Writer';
import { MessageDoesNotExist, SignalDoesNotExist } from './Errors';
import { computeDataType, DataType, EndianType } from '../shared/DataTypes';

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

  createNode(name: string, options?: { description?: string; attributes?: Attributes }) {
    let description: string | null;
    let attributes: Attributes;
    options && options.description ? (description = options.description) : (description = null);
    options && options.attributes ? (attributes = options.attributes) : (attributes = new Map());
    const node: Node = {
      name,
      description,
      attributes,
      add: () => {
        this.data.nodes.set(node.name, node);
        return node;
      },
      updateDescription: (content: string) => {
        node.description = content;
        return node;
      },
      addAttribute: (
        attrName: string,
        type: AttributeDataType,
        attrProps?: RequiredAttributeProps,
        attrOptions?: AdditionalAttributeObjects,
      ) => {
        const attr = this.createAttribute(attrName, type, attrProps, attrOptions);
        this.addAttribute(attr, { node: node.name });
        return node;
      },
    };
    return node;
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

    if (sendingNode) {
      this.createNode(sendingNode).add();
    }

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
      updateDescription: (content: string) => {
        message.description = content;
        return message;
      },
      updateNode: (node: string) => {
        message.sendingNode = node;
        this.createNode(node).add();
        return message;
      },
      addAttribute: (
        attrName: string,
        type: AttributeDataType,
        attrProps?: RequiredAttributeProps,
        attrOptions?: AdditionalAttributeObjects,
      ) => {
        const attr = this.createAttribute(attrName, type, attrProps, attrOptions);
        this.addAttribute(attr, { id: message.id });
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

  /**
   * Removes an existing message from the DBC data
   * @param messageName Name of the message to remove
   */
  removeMessage(messageName: string) {
    const ret = this.data.messages.delete(messageName);
    if (!ret) throw new Error(`${messageName} does not exist in the database`);
  }

  /**
   * Creates a signal based on characteristics such as start bit and length
   * @param name Name of the signal
   * @param startBit Bit position of where the signal is to start in the Message bitfield
   * @param length Length of the signal
   * @param options Additional options, such as signed, endian, etc.
   */
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

    if (receivingNodes.length) {
      receivingNodes.forEach((node: string) => {
        this.createNode(node).add();
      });
    }

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
      add: (messageName) => {
        this.addSignal(messageName, signal);
        return signal;
      },
      updateDescription: (content: string) => {
        signal.description = content;
        return signal;
      },
      addAttribute: (
        attrName: string,
        messageId: number,
        type: AttributeDataType,
        attrProps?: RequiredAttributeProps,
        attrOptions?: AdditionalAttributeObjects,
      ) => {
        const attr = this.createAttribute(attrName, type, attrProps, attrOptions);
        this.addAttribute(attr, { id: messageId, signalName: signal.name });
        return signal;
      },
    };
    return signal;
  }

  /**
   * Removes a signal from an existing message
   * @param signalName Name of the signal
   * @param messageName Name of the message containing the signal
   */
  removeSignal(signalName: string, messageName: string) {
    const msg = this.getMessageByName(messageName);
    if (msg) {
      const ret = msg.signals.delete(signalName);
      if (!ret) throw new Error(`${signalName} does not exist in message ${messageName}`);
    }
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
   * Convenience method that will create an Attribute object that can be appended to DBC data
   * @param name Name to be assigned to the attribute
   * @param type Attribute type: FLOAT, HEX, ENUM, INT, STRING
   * @param props Required properties of the attribute based on the type provided
   * @param options Additional attribute options that can be added
   */
  createAttribute(
    name: string,
    type: AttributeDataType,
    props?: RequiredAttributeProps,
    options?: AdditionalAttributeObjects,
  ) {
    let attrType: AttributeType = 'Global';
    let enumMembers: string[] | null = null;
    let min: number | null = null;
    let max: number | null = null;
    let value: string | null = null;
    let defaultValue: string | null = null;

    if (props) {
      if (props.type) attrType = props.type;

      if (type === 'ENUM' && !props.enumMembers) {
        throw new Error('enumMembers is a required property when defining an attribute with type ENUM');
      } else if (type === 'ENUM') {
        if (props.enumMembers) {
          enumMembers = props.enumMembers;
        }
      }

      if (type !== 'ENUM' && type !== 'STRING' && !props.min && !props.max) {
        throw new Error('min and max are required properties when defining anything other than type ENUM and STRING');
      } else {
        if (props.min !== undefined) min = props.min;
        if (props.max !== undefined) max = props.max;
      }

      if (options) {
        if (options.defaultValue !== undefined) {
          defaultValue = options.defaultValue;
        } else if (options.value !== undefined && options.defaultValue === undefined) {
          value = options.value;
          defaultValue = value;
        }
      }
    } else if (!props && type !== 'STRING') {
      throw new Error('Additional attribute properties are required for any type other than STRING');
    }

    const attribute: Attribute = {
      name,
      type: attrType,
      dataType: type,
      min,
      max,
      options: enumMembers,
      value,
      defaultValue,
    };
    return attribute;
  }

  /**
   * Adds an existing attribute to the DBC data based on the supplied type
   * @param attribute Attribute
   * @param options node, id, signalName, or evName
   */
  addAttribute(attribute: Attribute, options?: { node?: string; id?: number; signalName?: string; evName?: string }) {
    switch (attribute.type) {
      case 'Message':
        if (options && !options.id) {
          throw new Error('ID is a required option for adding a Message attribute');
        }
        if (options?.id) {
          const msg = this.getMessageById(options.id);
          msg.attributes.set(attribute.name, attribute);
        }
        break;
      case 'Signal':
        if ((options && !options.id) || !options?.signalName) {
          throw new Error('Signal name/and message ID are required options for adding a Signal attribute');
        }
        if (options?.id && options?.signalName) {
          const signal = this.getSignalByName(options.signalName, this.messageIdToName(options.id));
          signal.attributes.set(attribute.name, attribute);
        }
        break;
      case 'Node':
        if (options && !options.node) {
          throw new Error('Node name is a required option for adding a Node attribute');
        }
        if (options?.node) {
          const node = this.getNode(options.node);
          node.attributes.set(attribute.name, attribute);
        }
        break;
      case 'EnvironmentVariable':
        if (options && !options.evName) {
          throw new Error('Environmental Variable name is a required option for adding EV Attribute');
        }
        if (options?.evName) {
          const ev = this.getEnvironmentalVariable(options.evName);
          ev.attributes.set(attribute.name, attribute);
        }
        break;
      case 'Global':
        this.data.attributes.set(attribute.name, attribute);
        break;
    }
  }

  /**
   * Returns an environmental variable by name
   * @param name Name of environmental variable
   * @throws Error if environmental variable does not exist in database
   */
  getEnvironmentalVariable(name: string) {
    const ev = this.data.environmentVariables.get(name);
    if (!ev) {
      throw new Error('${name} is not an existing environmental variable in the database');
    }
    return ev;
  }
  /**
   * Returns a node if it exists in the database
   * @param name Name of the node (string)
   * @throws Error if node does not exist
   */
  getNode(name: string) {
    const node = this.data.nodes.get(name);
    if (!node) {
      throw new Error(`${name} is not an existing node in the database`);
    }
    return node;
  }

  /**
   * Returns the mapped name in the database based on the supplied CAN ID
   * @param id Message ID (number)
   * @throws Error if no message with the corresponding ID exists
   */
  messageIdToName(id: number) {
    const name = this.getMessageById(id).name;
    if (!name) {
      throw new Error(`Could not find ${id} in the database`);
    }
    return name;
  }

  /**
   *
   * Loads a DBC file, as opposed to the default method 'load', which is
   * a non-blocking/async call whose promise must be caught for the return data to be used.
   *
   * @param fileContent Full file path to the dbc file, including extension
   * @param throwOnError
   * @returns DbcData Data contained in the dbc file
   */
  load(fileContent: string, throwOnError: boolean = false): DbcData {
    let data = this.initDbcDataObj();

    let lineNum = 1;
    const errMap = new Map();

    const lines = fileContent.split('\n');
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

    // Clean up attributes that are not global/scoped
    Array.from(data.attributes.entries()).forEach(([key, attribute]) => {
      if (attribute.type !== 'Global') data.attributes.delete(key);
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
  write() {
    const writer = new Writer();
    writer.constructFile(this.data);
    return writer.dbcString;
  }

  /**
   *
   * Transforms the internal DBC data from class instance into a JSON object/string
   *
   * @param pretty Determines if JSON output should be formatted. Defaults to true.
   * @returns JSON representation of loaded DBC data
   */
  toJson(options?: { pretty: boolean }) {
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
    let pretty: boolean;
    options && options.pretty ? (pretty = options.pretty) : (pretty = true);
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
  add: (messageName: string) => Signal;
  updateDescription: (content: string) => Signal;
  addAttribute: (
    attrName: string,
    messageId: number,
    type: AttributeDataType,
    attrProps?: RequiredAttributeProps,
    attrOptions?: AdditionalAttributeObjects,
  ) => Signal;
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
  updateDescription: (content: string) => Message;
  updateNode: (node: string) => Message;
  addAttribute: (
    attrName: string,
    type: AttributeDataType,
    attrProps?: RequiredAttributeProps,
    attrOptions?: AdditionalAttributeObjects,
  ) => Message;
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
  add: () => Node;
  updateDescription: (content: string) => Node;
  addAttribute: (
    attrName: string,
    type: AttributeDataType,
    attrProps?: RequiredAttributeProps,
    attrOptions?: AdditionalAttributeObjects,
  ) => Node;
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
