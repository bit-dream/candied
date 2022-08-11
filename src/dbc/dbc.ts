import * as fs from 'fs';
import * as readline from 'readline';
import { Message, Signal } from './types';
import Tokenize from './tokenize'

interface DbcData {
  version: string | null;
  messages: Map<string, Message>;
  description: string | null;
  namespace: string[];
  busConfiguration: number | null;
  canNodes: string[];
}

class Dbc extends Tokenize {

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

  createMessage() {

  }

  addMessage(message: Message) {
    this.data.messages.set(message.name, message);
  }

  createSignal() {
    
  }

  addSignal(messageName: string, signal: Signal) {
    let message = this.data.messages.get(messageName);
    message?.signals.set(signal.name, signal);
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
    };
    for await (const line of rl) {
      lineInfo = this.parseLine(line);
      data = this.parseLineFromBaseToken(lineInfo, data);
    }

    // Add table data to class instance for future referencing
    this.data = data;
    return data;
  }

  decode(id: number, extended: boolean, dlc: number, payload: number[]) {
    // TODO
  }

  encode(message: Message) {
    // TODO
  }
}

export default Dbc;
