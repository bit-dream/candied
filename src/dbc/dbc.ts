import * as fs from 'fs';
import * as readline from 'readline';
import { Message, Signal, DbcData, CanFrame } from './types';
import Parser from './parser';
import { MessageDoesNotExist, InvalidPayloadLength } from './errors';

class Dbc extends Parser {
  data: DbcData;

  constructor() {
    super();

    this.data = {
      version: null,
      messages: new Map(),
      description: null,
      namespace: new Array(),
      busConfiguration: null,
      canNodes: new Array(),
      valueTables: null,
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

  createSignal(name: string, startBit: number, type: string) {
    // TODO
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

  getMessageByName(name: string) {
    try {
      const msg = this.data.messages.get(name);
      return msg;
    } catch (e) {
      throw new MessageDoesNotExist(`No message with name ${name} exists in the database.`);
    }
  }

  getAllMessages() {
    // TODO
  }

  getAllSignals() {
    // TODO
  }

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
      namespace: new Array(),
      busConfiguration: null,
      canNodes: new Array(),
      valueTables: new Map(),
    };
    for await (const line of rl) {
      lineInfo = this.parseLine(line);
      data = this.parseLineFromBaseToken(lineInfo, data);
    }

    // Add table data to class instance for future referencing
    this.data = data;
    return data;
  }

  decode(frame: CanFrame) {
    // TODO
  }

  encode(message: Message) {
    // TODO
  }

  createCanFrame(id: number, extended: boolean, payload: Uint8Array) : CanFrame {
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
