import { DbcData, Message, Signal, EndianType, ValueTable, Node, Attribute, AttributeDataType } from '../dbc/types';
import {
  ASTKinds,
  ASTNodeIntf,
  Parser,
  ParseResult,
  CanMessage,
  CanSignal,
  Version,
  NewSymbolValue,
  Val,
  ValTable,
  AttributeValue,
  AttributeDefault,
  GlobalAttribute,
  MessageAttribute,
  SignalAttribute,
  NodeAttribute,
  CanNode,
  Comment,
  SignalComment,
  MessageComment,
  NodeComment,
  EnvironmentVariable,
  EnvironmentVarData,
  EnvironmentVariableComment,
  MessageTransmitter,
  EnvironmentAttribute,
  EnvironmentVal
} from '../parser/parser';

export default class DbcParser extends Parser {
  parseResult: ParseResult;

  constructor(rawString: string) {
    super(rawString);
    this.parseResult = this.parse();
  }

  updateData(data: DbcData) {
    if (this.hasKindProp(this.parseResult.ast)) {
      const ast = this.parseResult.ast;
      switch (this.parseResult.ast.kind) {
        case ASTKinds.CanMessage:
          this.addMessage(data, this.parseResult.ast);
          break;
        case ASTKinds.CanSignal:
          this.addSignal(data, this.parseResult.ast);
          break;
        case ASTKinds.Version:
          this.addVersion(data, this.parseResult.ast);
          break;
        case ASTKinds.NewSymbolValue:
          this.addNewSymbolValue(data, this.parseResult.ast);
          break;
        case ASTKinds.Val:
          this.addVal(data, this.parseResult.ast);
          break;
        case ASTKinds.ValTable:
          this.addValTable(data, this.parseResult.ast);
          break;
        case ASTKinds.AttributeValue:
          this.addAttributeValue(data, this.parseResult.ast);
          break;
        case ASTKinds.AttributeDefault:
          this.addAttributeDefaultValue(data, this.parseResult.ast);
          break;
        case ASTKinds.GlobalAttribute:
          this.addGlobalAttribute(data, this.parseResult.ast);
          break;
        case ASTKinds.MessageAttribute:
          this.addMessageAttribute(data, this.parseResult.ast);
          break;
        case ASTKinds.SignalAttribute:
          this.addSignalAttribute(data, this.parseResult.ast);
          break;
        case ASTKinds.NodeAttribute:
          this.addNodeAttribute(data, this.parseResult.ast);
          break;
        case ASTKinds.CanNode:
          this.addNode(data, this.parseResult.ast);
          break;
        case ASTKinds.SignalComment:
          this.addSignalComment(data, this.parseResult.ast);
          break;
        case ASTKinds.MessageComment:
          this.addMessageComment(data, this.parseResult.ast);
          break;
        case ASTKinds.NodeComment:
          this.addNodeComment(data, this.parseResult.ast);
          break;
        case ASTKinds.Comment:
          this.addComment(data, this.parseResult.ast);
          break;
        case ASTKinds.EnvironmentVariable:
          console.log(this.parseResult.ast);
          break;
        case ASTKinds.EnvironmentAttribute:
          console.log(this.parseResult.ast);
          break;
        case ASTKinds.EnvironmentVal:
          console.log(this.parseResult.ast);
          break;
        case ASTKinds.EnvironmentVariableComment:
          console.log(this.parseResult.ast);
          break;
        case ASTKinds.MessageTransmitter:
          console.log(this.parseResult.ast);
          break;
        case ASTKinds.EnvironmentVarData:
          console.log(this.parseResult.ast);
          break;
      }
    }
    return data;
  }

  /* START OF HELPER FUNCTIONS FOR UPDATEDATA CALLBACK */

  private addComment(dbc: DbcData, data: Comment) {
    dbc.description = data.comment;
  }

  private addNode(dbc: DbcData, data: CanNode) {
    data.node_names.forEach((nodeName: string) => {
      const node = {} as Node;
      node.name = nodeName;
      node.description = null;
      node.attributes = new Map();
      if (node.name !== '') {
        dbc.nodes.set(nodeName, node);
      }
    });
  }

  private addMessage(dbc: DbcData, data: CanMessage) {
    const message = {} as Message;
    message.id = data.id;
    message.dlc = data.dlc;
    message.name = data.name;
    message.sendingNode = data.node;
    message.signals = new Map();
    message.description = null;
    message.attributes = new Map();
    dbc.messages.set(message.name, message);
  }

  private addSignal(dbc: DbcData, data: CanSignal) {
    const signal = {} as Signal;
    signal.name = data.name;
    signal.endianness = data.endian === 'Motorola' ? 'Motorola' : 'Intel';
    signal.startBit = data.start_bit;
    signal.length = data.length;
    signal.signed = data.signed;
    signal.max = data.max;
    signal.min = data.min;
    signal.factor = data.factor;
    signal.offset = data.offset;
    signal.multiplex = data.multiplex;
    signal.receivingNodes = data.nodes;
    signal.unit = data.unit;
    signal.valueTable = null;
    signal.description = null;
    signal.attributes = new Map();
    /* Signals come directly after a message tag, so we can just append
            the current signal instance to the last message found in the array */
    const messageList = Array.from(dbc.messages.keys());
    const lastKey = messageList[messageList.length - 1];
    let msg: Message | undefined;
    if (dbc.messages.has(lastKey)) {
      msg = dbc.messages.get(lastKey);
      msg?.signals.set(signal.name, signal);
    }
  }

  private addSignalComment(dbc: DbcData, data: SignalComment) {
    const msgName = this.getMessageNameFromId(dbc, data.id);
    if (msgName) {
      const msg = dbc.messages.get(msgName);
      const signal = msg?.signals.get(data.name);
      if (signal) {
        signal.description = data.comment;
      }
    } else {
      // TODO: Throw error that message does not exist in data
    }
  }

  private addMessageComment(dbc: DbcData, data: MessageComment) {
    const msgName = this.getMessageNameFromId(dbc, data.id);
    if (msgName) {
      const msg = dbc.messages.get(msgName);
      if (msg) {
        msg.description = data.comment;
      }
    } else {
      // TODO: Throw error that message does not exist in data
    }
  }

  private addNodeComment(dbc: DbcData, data: NodeComment) {
    const node = dbc.nodes.get(data.name);
    if (node) {
      node.description = data.comment;
    }
  }

  private addVersion(dbc: DbcData, data: Version) {
    dbc.version = data.version;
  }

  private addNewSymbolValue(dbc: DbcData, data: NewSymbolValue) {
    dbc.newSymbols.push(data.symbol);
  }

  private addVal(dbc: DbcData, data: Val) {
    // Need to find specific signal in dataset to append signal table to
    const messageName: string | null = null;
    for (const [key, value] of dbc.messages) {
      const msg = dbc.messages.get(key);
      if (msg && msg.id === data.id) {
        const signals = msg.signals;
        const signal = signals.get(data.name);
        const table: ValueTable = data.enum;
        if (signal) {
          signal.valueTable = table;
        }
        return;
      }
    }
  }

  private addValTable(dbc: DbcData, data: ValTable) {
    const table: ValueTable = data.enum;
    dbc.valueTables?.set(data.name, table);
  }

  private convert2AttributeType(str: string): AttributeDataType {
    switch (str) {
      case 'INT':
        return 'INT';
      case 'STRING':
        return 'STRING';
      case 'FLOAT':
        return 'FLOAT';
      case 'ENUM':
        return 'ENUM';
      case 'HEX':
        return 'HEX';
      default:
        // Uknown type encountered, conver to string so the remaining props are not parsed
        return 'STRING';
    }
  }

  private addGlobalAttribute(dbc: DbcData, data: GlobalAttribute) {
    const attribute = {} as Attribute;
    const dataType = this.convert2AttributeType(data.type);
    attribute.name = data.name;
    attribute.type = 'Global';
    attribute.dataType = dataType;
    attribute.options = new Array();
    attribute.defaultValue = null;
    attribute.value = null;
    attribute.min = dataType === 'FLOAT' || dataType === 'INT' || dataType === 'HEX' ? data.min : null;
    attribute.max = dataType === 'FLOAT' || dataType === 'INT' || dataType === 'HEX' ? data.max : null;
    attribute.options = dataType === 'ENUM' ? data.enum : null;
    if (attribute.name && attribute.name !== '') {
      dbc.attributes.set(attribute.name, attribute);
    }
  }

  private addMessageAttribute(dbc: DbcData, data: MessageAttribute) {
    const attribute = {} as Attribute;
    const dataType = this.convert2AttributeType(data.type);
    attribute.name = data.name;
    attribute.type = 'Message';
    attribute.dataType = this.convert2AttributeType(data.type);
    attribute.options = new Array();
    attribute.defaultValue = null;
    attribute.value = null;
    attribute.min = dataType === 'FLOAT' || dataType === 'INT' || dataType === 'HEX' ? data.min : null;
    attribute.max = dataType === 'FLOAT' || dataType === 'INT' || dataType === 'HEX' ? data.max : null;
    attribute.options = dataType === 'ENUM' ? data.enum : null;
    if (attribute.name && attribute.name !== '') {
      dbc.attributes.set(attribute.name, attribute);
    }
  }

  private addSignalAttribute(dbc: DbcData, data: SignalAttribute) {
    const attribute = {} as Attribute;
    const dataType = this.convert2AttributeType(data.type);
    attribute.name = data.name;
    attribute.type = 'Signal';
    attribute.dataType = this.convert2AttributeType(data.type);
    attribute.options = new Array();
    attribute.defaultValue = null;
    attribute.value = null;
    attribute.min = dataType === 'FLOAT' || dataType === 'INT' || dataType === 'HEX' ? data.min : null;
    attribute.max = dataType === 'FLOAT' || dataType === 'INT' || dataType === 'HEX' ? data.max : null;
    attribute.options = dataType === 'ENUM' ? data.enum : null;
    if (attribute.name && attribute.name !== '') {
      dbc.attributes.set(attribute.name, attribute);
    }
  }

  private addNodeAttribute(dbc: DbcData, data: NodeAttribute) {
    const attribute = {} as Attribute;
    const dataType = this.convert2AttributeType(data.type);
    attribute.name = data.name;
    attribute.type = 'Node';
    attribute.dataType = this.convert2AttributeType(data.type);
    attribute.options = new Array();
    attribute.defaultValue = null;
    attribute.value = null;
    attribute.min = dataType === 'FLOAT' || dataType === 'INT' || dataType === 'HEX' ? data.min : null;
    attribute.max = dataType === 'FLOAT' || dataType === 'INT' || dataType === 'HEX' ? data.max : null;
    attribute.options = dataType === 'ENUM' ? data.enum : null;
    if (attribute.name && attribute.name !== '') {
      dbc.attributes.set(attribute.name, attribute);
    }
  }

  private addAttributeDefaultValue(dbc: DbcData, data: AttributeDefault) {
    const attr = dbc.attributes.get(data.name);
    if (attr) {
      attr.defaultValue = data.value;
      attr.value = data.value;
    }
  }

  private addAttributeValue(dbc: DbcData, data: AttributeValue) {
    const attr = dbc.attributes.get(data.name);
    if (attr) {
      attr.value = data.value;
      const msgName = this.getMessageNameFromId(dbc, data.id);
      switch (data.type) {
        // Add existing attribute to proper type
        case 'Signal':
          if (msgName) {
            const msg = dbc.messages.get(msgName);
            if (msg) {
              const signal = msg.signals.get(data.signal);
              if (signal) {
                signal.attributes.set(attr.name, attr);
                dbc.attributes.delete(attr.name);
              }
            }
          }
          break;
        case 'Message':
          if (msgName) {
            const msg = dbc.messages.get(msgName);
            if (msg) {
              msg.attributes.set(attr.name, attr);
              dbc.attributes.delete(attr.name);
            }
          }
          break;
        case 'Node':
          const node = dbc.nodes.get(data.node);
          if (node) {
            node.attributes.set(attr.name, attr);
            dbc.attributes.delete(attr.name);
          }
          break;
        case 'Global':
          break;
        default:
          break;
      }
    }
  }

  private getMessageNameFromId(dbc: DbcData, id: number): string | null {
    const msgNames = Array.from(dbc.messages.keys());
    let msgName: string | null = null;
    for (const name of msgNames) {
      const msg = dbc.messages.get(name);
      if (msg && msg.id === id) {
        msgName = name;
        break;
      }
    }
    return msgName;
  }

  private hasKindProp(obj: unknown): obj is ASTNodeIntf {
    return typeof obj === 'object' && obj !== null && 'kind' in obj;
  }
}
