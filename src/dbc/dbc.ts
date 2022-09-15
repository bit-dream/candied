import * as fs from 'fs';
import * as readline from 'readline';
import { Message, Signal, DbcData, CanFrame, EndianType, ValueTable } from './types';
import Parser from './parser';
import Writer from './writer';
import { MessageDoesNotExist, InvalidPayloadLength, SignalDoesNotExist } from './errors';

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
 * By default when a new Dbc() instance is created, the encapulsated data will be empty.
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
class Dbc extends Parser {
  data: DbcData;

  constructor() {
    super();

    this.data = {
      version: null,
      messages: new Map(),
      description: null,
      busConfiguration: null,
      canNodes: new Array(),
      valueTables: null,
      attributes: null,
    };
  }

  /**
   * Adds a version number to dbc data
   */
  set version(version: string) {
    this.data.version = version;
  }

  /**
   * Adds a bus speed configuration
   */
  set busConfiguration(speed: number) {
    // TODO: Might need to do some input validation to ensure we are not writing bad
    // data to a dbc file
    this.data.busConfiguration = speed;
  }

  /**
   * Adds a list of CAN nodes that exist for the network topology
   */
  set canNodes(nodes: string[]) {
    this.data.canNodes = nodes;
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
   *
   * @param name Name of CAN message
   * @param id ID of CAN message
   * @param dlc Data Length Code (data length) of CAN message
   * @param sendingNode Name of node that sends this message
   * @param description Short description of what the message is/does
   * @returns Message
   */
  createMessage(
    name: string,
    id: number,
    dlc: number,
    sendingNode: null | string = null,
    description: null | string = null,
  ) {
    const message: Message = {
      name,
      id,
      dlc,
      sendingNode,
      signals: new Map(),
      description,
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
    if (Array.isArray(message)) {
      message.forEach((msg) => {
        this.data.messages.set(msg.name, msg);
      });
    } else {
      this.data.messages.set(message.name, message);
    }
    // TODO Validate that message ID does not conflict
    // with other IDs. If it does, throw error
  }

  removeMessage(messageName: string) {
    this.data.messages.delete(messageName);
  }

  createSignal(
    name: string,
    startBit: number,
    length: number,
    signed: boolean = false,
    endianness: EndianType = 'Intel',
    min: number = 0,
    max: number = 0,
    factor: number = 1,
    offset: number = 0,
    unit: string | null = null,
    description: string | null = null,
    multiplex: string | null = null,
    receivingNodes: string[] = new Array(),
    valueTable: ValueTable | null = null,
  ) {
    if (!unit) {
      unit = '';
    }
    const signal: Signal = {
      name,
      multiplex,
      startBit,
      length,
      endianness,
      signed,
      factor,
      offset,
      min,
      max,
      unit,
      receivingNodes,
      description,
      valueTable,
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
  async load(file: string): Promise<DbcData> {
    const fileStream = fs.createReadStream(file);

    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let lineInfo = null;
    let data: DbcData = {
      version: null,
      messages: new Map(),
      description: null,
      busConfiguration: null,
      canNodes: new Array(),
      valueTables: new Map(),
      attributes: null,
    };
    for await (const line of rl) {
      lineInfo = this.parseLine(line);
      data = this.parseLineFromBaseToken(lineInfo, data);
    }

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
    const writer = new Writer(filePath);
    writer.constructFile(this.data);
  }

}

export default Dbc;
