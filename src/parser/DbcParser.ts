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
  CanEnvironmentVariable,
  EnvironmentVarData,
  EnvironmentVariableComment,
  MessageTransmitter,
  EnvironmentAttribute,
  EnvironmentVal,
  CanSignalGroup,
  SigValType,
  SignalMultiplexVal,
} from '../parser/parser';
import { computeDataType, EndianType } from '../shared/DataTypes';
import {
  AccessType,
  Attribute,
  AttributeDataType,
  DbcData,
  EnvironmentVariable,
  EnvType,
  Message,
  MultiplexSignal,
  Node,
  Signal,
  SignalMultiplexValue,
  ValueTable,
} from '../dbc/DbcTypes';
import Can from '../can/Can';

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
        case ASTKinds.SignalMultiplexVal:
          this.addSignalMultiplexValue(data, this.parseResult.ast);
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
        case ASTKinds.CanEnvironmentVariable:
          this.addEnvironmentVariable(data, this.parseResult.ast);
          break;
        case ASTKinds.EnvironmentAttribute:
          this.addEnvironmentAttribute(data, this.parseResult.ast);
          break;
        case ASTKinds.EnvironmentVal:
          this.addEnvironmentVal(data, this.parseResult.ast);
          break;
        case ASTKinds.EnvironmentVariableComment:
          this.addEnvironmentVariableComment(data, this.parseResult.ast);
          break;
        case ASTKinds.EnvironmentVarData:
          this.addEnvironmentVariableData(data, this.parseResult.ast);
          break;
        case ASTKinds.MessageTransmitter:
          this.addMessageTransmitter(data, this.parseResult.ast);
          break;
        case ASTKinds.CanSignalGroup:
          this.addSignalGroup(data, this.parseResult.ast);
          break;
        case ASTKinds.SigValType:
          this.addSignalValType(data, this.parseResult.ast);
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

  private addEnvironmentVariableData(dbc: DbcData, data: EnvironmentVarData) {
    const envVar = dbc.environmentVariables.get(data.name);
    if (envVar) {
      envVar.dataBytesLength = data.value;
    }
  }

  private addEnvironmentVariable(dbc: DbcData, data: CanEnvironmentVariable) {
    const envVar = {} as EnvironmentVariable;
    envVar.name = data.name;
    envVar.type = this.convert2EnvType(data.type);
    envVar.initialValue = data.initial_value;
    envVar.min = data.min;
    envVar.max = data.max;
    envVar.evId = data.ev_id;
    envVar.accessNode = data.node;
    envVar.accessType = this.convert2AccessType(data.access_type);
    envVar.attributes = new Map();
    envVar.valueTable = null;
    envVar.dataBytesLength = null;
    envVar.description = null;
    envVar.unit = data.unit;
    dbc.environmentVariables.set(envVar.name, envVar);
  }

  private addMessage(dbc: DbcData, data: CanMessage) {
    const can = new Can();
    const message = {} as Message;
    message.id = can.isIdExtended(data.id) ? can.unsetExtendedFlag(data.id) : data.id;
    message.extended = can.isIdExtended(data.id);
    message.dlc = data.dlc;
    message.name = data.name;
    message.sendingNode = data.node;
    message.signals = new Map();
    message.baseSignals = new Map();
    message.multiplexSignals = new Map();
    message.description = null;
    message.attributes = new Map();
    message.signalGroups = new Map();
    dbc.messages.set(message.name, message);
  }

  private addSignalMultiplexValue(dbc: DbcData, data: SignalMultiplexVal) {
    const can = new Can();
    const canId = can.isIdExtended(data.id) ? can.unsetExtendedFlag(data.id) : data.id;
    const message = Array.from(dbc.messages.values()).find((value) => value.id === canId);
    if (message) {
      const mulPlexSig = message.multiplexSignals.get(data.switch_name);
      const mulPlexSigBase = message.multiplexSignals.get(data.name);
      const dataSignal = message.signals.get(data.name);
      if (mulPlexSig && dataSignal) {
        let multiplexSignal = {} as MultiplexSignal;
        if (mulPlexSigBase) {
          multiplexSignal = mulPlexSigBase;
          message.multiplexSignals.delete(data.name);
        } else {
          multiplexSignal = {} as MultiplexSignal;
          multiplexSignal.signal = dataSignal;
          multiplexSignal.children = new Map();
        }

        data.value_ranges.forEach((valRange) => {
          const start = parseInt(valRange[0], 10);
          const end = parseInt(valRange[1], 10);

          for (let i = start; i <= end; i++) {
            let children = mulPlexSig.children.get(i);
            if (!children) {
              mulPlexSig.children.set(i, []);
              children = mulPlexSig.children.get(i);
            }

            children?.push(multiplexSignal);
          }
        });
      }
    }
  }

  private addSignal(dbc: DbcData, data: CanSignal) {
    const signal = {} as Signal;
    signal.name = data.name;
    signal.endian = data.endian === 'Motorola' ? 'Motorola' : 'Intel';
    signal.startBit = data.start_bit;
    signal.length = data.length;
    signal.signed = data.signed;
    signal.max = data.max;
    signal.min = data.min;
    signal.factor = data.factor;
    signal.offset = data.offset;
    signal.multiplex = data.multiplex;
    signal.multiplexer = data.multiplexer;
    signal.receivingNodes = data.nodes;
    signal.unit = data.unit;
    signal.valueTable = null;
    signal.description = null;
    signal.attributes = new Map();
    signal.dataType = computeDataType(signal.length, signal.signed);
    /* Signals come directly after a message tag, so we can just append
            the current signal instance to the last message found in the array */
    const messageList = Array.from(dbc.messages.keys());
    const lastKey = messageList[messageList.length - 1];
    let msg: Message | undefined;
    if (dbc.messages.has(lastKey)) {
      msg = dbc.messages.get(lastKey);
      msg?.signals.set(signal.name, signal);

      if (!signal.multiplexer && (signal.multiplex ?? '').length === 0) {
        msg?.baseSignals.set(signal.name, signal);
      } else if (signal.multiplexer) {
        const multiplexSignal = {} as MultiplexSignal;
        multiplexSignal.signal = signal;
        multiplexSignal.children = new Map();
        msg?.multiplexSignals.set(multiplexSignal.signal.name, multiplexSignal);
      }
    }
  }

  private addSignalComment(dbc: DbcData, data: SignalComment) {
    const can = new Can();
    const canId = can.isIdExtended(data.id) ? can.unsetExtendedFlag(data.id) : data.id;
    const msgName = this.getMessageNameFromId(dbc, canId);
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

  private addEnvironmentVariableComment(dbc: DbcData, data: EnvironmentVariableComment) {
    const envVars = dbc.environmentVariables;
    const envVar = envVars.get(data.name);
    if (envVar) {
      envVar.description = data.comment;
    }
  }

  private addMessageComment(dbc: DbcData, data: MessageComment) {
    const can = new Can();
    const canId = can.isIdExtended(data.id) ? can.unsetExtendedFlag(data.id) : data.id;
    const msgName = this.getMessageNameFromId(dbc, canId);
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

  private addEnvironmentVal(dbc: DbcData, data: EnvironmentVal) {
    const envVar = dbc.environmentVariables.get(data.name);
    if (envVar) {
      envVar.valueTable = data.enum;
    }
  }

  private addVal(dbc: DbcData, data: Val) {
    // Need to find specific signal in dataset to append signal table to
    const messageName: string | null = null;
    for (const [key, value] of dbc.messages) {
      const msg = dbc.messages.get(key);
      const can = new Can();
      const canId = can.isIdExtended(data.id) ? can.unsetExtendedFlag(data.id) : data.id;
      if (msg && msg.id === canId) {
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
        // Uknown type encountered, convert to string so the remaining props are not parsed
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

  private addEnvironmentAttribute(dbc: DbcData, data: EnvironmentAttribute) {
    const attribute = {} as Attribute;
    const dataType = this.convert2AttributeType(data.type);
    attribute.name = data.name;
    attribute.type = 'EnvironmentVariable';
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
    if (!dbc.attributes.has(data.name)) return;
    const attr = Object.assign({}, dbc.attributes.get(data.name), { value: data.value });

    attr.value = data.value;
    const can = new Can();
    const canId = can.isIdExtended(data.id) ? can.unsetExtendedFlag(data.id) : data.id;
    const msgName = this.getMessageNameFromId(dbc, canId);
    switch (data.type) {
      // Add existing attribute to proper type
      case 'Signal':
        if (msgName) {
          const msg = dbc.messages.get(msgName);
          if (msg) {
            const signal = msg.signals.get(data.signal);
            if (signal) {
              signal.attributes.set(attr.name, attr);
            }
          }
        }
        break;
      case 'Message':
        if (msgName) {
          const msg = dbc.messages.get(msgName);
          if (msg) {
            msg.attributes.set(attr.name, attr);
          }
        }
        break;
      case 'Node':
        const node = dbc.nodes.get(data.node);
        if (node) {
          node.attributes.set(attr.name, attr);
        }
        break;
      case 'Global':
        dbc.attributes.set(data.name, attr);
        break;
      case 'EnvironmentVariable':
        const ev = dbc.environmentVariables.get(data.node);
        if (ev) {
          ev.attributes.set(attr.name, attr);
        }
        break;
      default:
        break;
    }
  }

  private addMessageTransmitter(dbc: DbcData, data: MessageTransmitter) {
    const can = new Can();
    const canId = can.isIdExtended(data.id) ? can.unsetExtendedFlag(data.id) : data.id;
    dbc.networkBridges.set(canId, data.nodes);
  }

  private addSignalGroup(dbc: DbcData, data: CanSignalGroup) {
    const can = new Can();
    const canId = can.isIdExtended(data.id) ? can.unsetExtendedFlag(data.id) : data.id;
    const name = this.getMessageNameFromId(dbc, canId);
    if (name) {
      const msg = dbc.messages.get(name);
      if (msg) {
        const groupData = {
          name: data.name,
          id: canId,
          groupId: data.group_number,
          signals: data.signals,
        };
        msg.signalGroups.set(data.name, groupData);
      }
    }
  }

  private addSignalValType(dbc: DbcData, data: SigValType) {
    const can = new Can();
    const canId = can.isIdExtended(data.id) ? can.unsetExtendedFlag(data.id) : data.id;
    const msgName = this.getMessageNameFromId(dbc, canId);
    if (msgName) {
      const msg = dbc.messages.get(msgName);
      if (msg) {
        const signal = msg.signals.get(data.name);
        if (signal) {
          switch (data.type) {
            // TODO: Should we enforce that the data type is float/double even if bits dont match?
            case 1:
              signal.dataType = computeDataType(signal.length, signal.signed, true);
              break;
            case 2:
              signal.dataType = computeDataType(signal.length, signal.signed, true);
              break;
          }
        }
      }
    }
  }

  private convert2EnvType(type: string): EnvType {
    switch (type) {
      case '0':
        return 'Integer';
      case '1':
        return 'Float';
      case '2':
        return 'String';
      default:
        return 'String';
    }
  }

  private convert2AccessType(type: string): AccessType {
    switch (type.trim().slice(-1)) {
      case '0':
        return 'Unrestricted';
      case '1':
        return 'Read';
      case '2':
        return 'Write';
      case '3':
        return 'ReadWrite';
      default:
        return 'Read';
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
