import * as fs from 'fs';
import * as readline from 'readline';
import { Message, Signal, DbcData, CanFrame } from './types';
import Parser from './parser';
import Writer from './writer';
import { MessageDoesNotExist, InvalidPayloadLength, SignalDoesNotExist } from './errors';

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
      attributes: null
    };
  }

  set version(version: string) {
    this.data.version = version;
  }

  set busConfiguration(speed: number) {
    this.data.busConfiguration = speed;
  }

  set canNodes(nodes: (string)[]) {
    this.data.canNodes = nodes;
  }

  set description(description: string) {
    this.data.description = description;
  }

  createMessage(name: string, id: number, dlc: number, sendingNode = null, description = null) {
    const message: Message = {
      'name': name,
      'id': id,
      'dlc': dlc,
      'sendingNode': sendingNode,
      'signals': new Map(),
      'description': description,
    };
    return message;
  }

  addMessage(message: Message) {
    this.data.messages.set(message.name, message);
    // TODO Validate that message ID does not conflict 
    // with other IDs. If it does, throw error
  }

  createSignal(name: string, startBit: number, length: number) {
    const signal: Signal = {
      'name': name,
      'multiplex': null,
      'startBit': startBit,
      'length': length,
      'endianness': 'Intel',
      'signed': false,
      'factor': 1,
      'offset': 0,
      'min': 0,
      'max': 0,
      'unit': '',
      'receivingNodes': new Array(),
      'description': null,
      'valueTable': null,
    };
    return signal;
  }

  addSignal(messageName: string, signal: Signal) {
    const message = this.data.messages.get(messageName);
    message?.signals.set(signal.name, signal);
  }

  getMessageById(id: number) : Message {
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
      for (let [signal, signalObj] of signals) {
        if (signal === name) {
          return signalObj;
        }
      }
    } else {
      throw new SignalDoesNotExist(`Signal could not be found in ${messageName}, because the
      signal list for that message is empty.`)
    }
    throw new SignalDoesNotExist(`Could not find ${name} in signal list.`);
  }

  getSignalsByName(name: string) {
    // TODO
  }

  /**
   * 
   * @param file string
   * @returns Promise<DbcData> 
   */
  async load(file: string) : Promise<DbcData> {
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
      attributes: null
    };
    for await (const line of rl) {
      lineInfo = this.parseLine(line);
      data = this.parseLineFromBaseToken(lineInfo, data);
    }

    // Add table data to class instance for future referencing
    this.data = data;
    return data;
  }

  write(filePath: string) {
    const writer = new Writer(filePath);
    writer.constructFile(this.data);
  };

  private decode(frame: CanFrame) {
    // TODO
  }

  private encode(message: Message) {
    // TODO
  }

  private createCanFrame(id: number, extended: boolean, payload: Uint8Array) : CanFrame {
    if (payload.length > 8) {
      throw new InvalidPayloadLength(`Can not have payloads over 8 bytes: ${payload}`)
    } else if (payload.length === 0) {
      throw new InvalidPayloadLength(`Payload is either empty or undefined: ${payload}`)
    }
    const frame = {
      id: id,
      dlc: payload.length,
      extended: extended,
      payload: payload
    }
    return frame
  }
}

export default Dbc;
