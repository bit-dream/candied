import {
  Token,
  Tokens,
  Message,
  Signal,
  MessageRegex,
  SignalRegex,
  VersionRegex,
  CanConfigRegex,
  CanNodesRegex,
  DbcData,
  DefinitionRegex,
  ValueTable,
} from './types';
import tokens from './tokens';

class Parser {
  tokens: Tokens;

  constructor() {
    this.tokens = tokens;
  }

  private addToken(tokenName: string, tokenData: Token) {
    this.tokens[tokenName] = tokenData;
  }

  /**
   *
   * @param line Raw line from dbc file
   * @returns Object
   */
  protected parseLine(line: string) {
    const baseTokens = Object.keys(this.tokens);

    let foundToken: string | null = null;
    let regexMatch = null;
    const foundTokens = new Map();
    let keys = new Array();
    baseTokens.forEach((token) => {
      if (line.trimStart().startsWith(token)) {
        foundToken = token;
        regexMatch = [line.match(this.tokens[token].dataFormat)];
        foundTokens.set(token, regexMatch);
      }
      // TODO: Do exception handling for when line doesn't have token
    });

    keys = Array.from(foundTokens.keys());
    keys = keys.sort((a, b) => b.length - a.length);

    return {
      line,
      baseToken: keys[0],
      regexMatch: foundTokens.get(keys[0]),
    };
  }

  /**
   *
   * @param lineInfo Info collected about an individual line parsed from basicTokenization()
   * @param data
   * @returns
   */
  protected parseLineFromBaseToken(lineInfo: any, data: DbcData) {
    if (lineInfo.baseToken !== null) {
      const baseTokens = Object.keys(this.tokens);

      let msg: Message | undefined;
      let groups;
      try {
        groups = lineInfo.regexMatch[0].groups;
      } catch (error) {
        return data;
      }
      switch (lineInfo.baseToken) {
        case 'VERSION':
          data.version = this.parseVersion(groups);
          break;
        case 'BO_':
          data.messages.set(groups.messageName, this.parseMessage(groups));
          break;
        case 'SG_':
          /* Signals come directly after a message tag, so we can just append
            the current signal instance to the last message found in the array */
          const messageList = Array.from(data.messages.keys());
          const lastKey = messageList[messageList.length - 1];
          if (data.messages.has(lastKey)) {
            msg = data.messages.get(lastKey);
            msg?.signals.set(groups.name, this.parseSignal(groups));
          }
          break;
        case 'BU_':
          data.canNodes = this.parseCanNodes(groups);
          break;
        case 'BS_':
          data.busConfiguration = this.parseCanConfiguration(groups);
          break;
        case 'CM_':
          data.description = groups.comment;
          break;
        case 'CM_ BU_':
          break;
        case 'CM_ BO_':
          msg = this.getMessageByIdFromData(data, parseInt(groups.id, 10));
          if (msg) {
            msg.description = groups.comment;
          }
          break;
        case 'CM_ SG_':
          msg = this.getMessageByIdFromData(data, parseInt(groups.id, 10));
          if (msg) {
            const signal = this.getSignalByNameFromMsg(msg, groups.name);
            if (signal) {
              signal.description = groups.comment;
            }
          }
          break;
        case 'VAL_TABLE_':
          const definitions = this.extractDefinition(groups);
          data.valueTables?.set(groups.name, definitions);
          break;
        case 'VAL_':
          const definition = this.extractDefinition(groups);
          msg = this.getMessageByIdFromData(data, parseInt(groups.id, 10));
          if (msg) {
            this.assignToSigValTable(msg, groups.name, definition);
          }
          break;

        default:
          break;
      }
    }
    return data;
  }

  protected assignToSigValTable(msg: Message, signalName: string, value: ValueTable) {
    const signal = this.getSignalByNameFromMsg(msg, signalName);
    if (signal) {
      signal.valueTable = value;
    }
  }

  protected getSignalByNameFromMsg(msg: Message, name: string) {
    const signals = msg.signals;
    const signal = signals.get(name);
    return signal;
  }

  protected getMessageByIdFromData(data: DbcData, id: number) {
    const messages = data.messages;
    for (const [name, message] of messages) {
      if (message.id === id) {
        return message;
      }
    }
  }

  protected extractDefinition(obj: DefinitionRegex) {
    const regEx = /(?<value>[0-9-]+) "(?<description>(?:[^"\\]|\\.)*)"/gi;
    const matches = obj.definition.matchAll(regEx);
    const definitions = new Map();

    for (const match of matches) {
      if (match.groups) {
        definitions.set(parseInt(match.groups.value, 10), match.groups.description);
      }
    }
    return definitions;
  }

  protected parseMessage(obj: MessageRegex) {
    const message: Message = {
      name: obj.messageName,
      id: parseInt(obj.id, 10),
      dlc: parseInt(obj.dlc, 10),
      sendingNode: obj.sendingNode,
      signals: new Map(),
      description: null,
    };
    return message;
  }

  protected parseSignal(obj: SignalRegex) {
    const signal: Signal = {
      name: obj.name,
      multiplex: obj.plex,
      startBit: parseInt(obj.startBit, 10),
      length: parseInt(obj.length, 10),
      endianness: parseInt(obj.endian, 10) === 1 ? 'Intel' : 'Motorola',
      signed: obj.signed === '+' ? true : false,
      factor: parseInt(obj.factor, 10),
      offset: parseInt(obj.offset, 10),
      min: parseInt(obj.min, 10),
      max: parseInt(obj.max, 10),
      unit: obj.unit,
      receivingNodes: obj.receivingNodes.trim().split(' '),
      description: null,
      valueTable: null,
    };
    return signal;
  }

  protected parseVersion(obj: VersionRegex) {
    const version: string = obj.version;
    return version;
  }

  protected parseCanNodes(obj: CanNodesRegex) {
    const canNodes: string[] = obj.nodes.trim().split(' ');
    return canNodes;
  }

  protected parseCanConfiguration(obj: CanConfigRegex) {
    const busConfiguration: number = parseInt(obj.speed, 10);
    return busConfiguration;
  }
}

export default Parser;
