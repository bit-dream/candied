import * as fs from 'fs';
import * as readline from 'readline';
import { Message, Signal, DbcData } from './types';
import Parser from './parser';
import { MessageDoesNotExist } from './errors';

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
      valueTables: null
    };
  }

  set version(version: string) {
    this.data.version = version;
  }

  set busConfiguration(speed: number) {
    this.data.busConfiguration = speed;
  }

  set canNodes(nodes: Array<string>) {
    this.data.canNodes = nodes;
  }

  set description(description: string) {
    this.data.description = description;
  }

  createMessage(name: string, id: number, dlc: number, sendingNode = null, description = null) {
    let message: Message = {
      name: name,
      id: id,
      dlc: dlc,
      sendingNode: sendingNode,
      signals: new Map(),
      description: description,
    };
    return message;
  }

  addMessage(message: Message) {
    this.data.messages.set(message.name, message);
  }

  createSignal(name: string, startBit: number, type: string) {}

  addSignal(messageName: string, signal: Signal) {
    let message = this.data.messages.get(messageName);
    message?.signals.set(signal.name, signal);
  }

  getMessageById(id: number) {
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

  async load(file: string) {
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
      valueTables: new Map()
    };
    for await (const line of rl) {
      lineInfo = this.parseLine(line);
      data = this.parseLineFromBaseToken(lineInfo, data);
    }

    // Add table data to class instance for future referencing
    this.data = data;
    return data;
  }

  decode(message: Message) {
    // TODO
  }

  encode(message: Message) {
    // TODO
  }
}

export default Dbc;
