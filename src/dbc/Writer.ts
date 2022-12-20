import * as fs from 'fs';
import {
    Attribute,
    AttributeDataType,
    DbcData,
    EnvironmentVariable, Message,
    NetworkBridges, Signal, SignalGroup,
    TxMessages,
    ValueTable
} from "./Dbc";

class Writer {
  file: string;
  constructor(file: string, overwrite = false) {
    this.file = file;
  }

  /**
   * Main constructor class that will organize and write all
   * attributes of DbcData structure
   * @param data dbc data loaded or created using main DBC class
   */
  constructFile(data: DbcData) {
    // This will clear out the file before writing to it
    fs.writeFileSync(this.file, '', { flag: 'w+' });
    // Main file attributes
    this.writeVersion(data.version ? data.version : '');
    this.writeNamespace(data.newSymbols);
    this.writeBusSpeed(data.busSpeed);
    this.writeNodes(Array.from(data.nodes.keys()));
    if (data.valueTables) {
      this.writeValTable(data.valueTables);
    }

    // Both messages and signals
    this.writeMessagesAndSignals(data.messages);
    this.writeMessageTransmitters(data.networkBridges);

    // Write all comments
    if (data.description) {
      this.writeBaseComment(data.description);
    }
    this.writeMessageAndSignalComments(data.messages);
    this.writeAttributeDefinitions(data);
    this.writeAttributeDefaults(data);
    this.writeAttributeValues(data);
    this.writeSignalGroups(data.messages);
    this.writeSignalTables(data.messages);
    this.writeEnvVarTables(data.environmentVariables);
  }

  /**
   *
   * @param version Version of the dbc file
   */
  writeVersion(version: string) {
    const lineContent = `VERSION "${version}"`;
    this.writeLine(lineContent);
    this.writeLine('');
  }

  writeMessageTransmitters(transmitters: NetworkBridges) {
    transmitters.forEach((transmitter: TxMessages, canId: number) => {
      const lineContent = `BO_TX_BU_ ${canId} : ${transmitter.join(',')};`;
      this.writeLine(lineContent);
      this.writeLine('');
    });
    this.writeLine('');
  }

  writeNamespace(ns: string[] | null = null) {
    const lineContent = `NS_:`;
    this.writeLine(lineContent);
    if (ns) {
      ns.forEach((newSymbol) => {
        this.writeLine(`    ${newSymbol}`);
      });
    }
    this.writeLine('');
  }

  /**
   * Speed of the CAN bus, typically expressed as 250, 500, etc
   * @param busConfiguration Speed of the CAN bus
   */
  writeBusSpeed(busConfiguration: number | null) {
    let lineContent = '';
    if (busConfiguration === null) {
      lineContent = `BS_:`;
    } else {
      lineContent = `BS_: ${busConfiguration}`;
    }
    this.writeLine(lineContent);
    this.writeLine('');
  }

  /**
   * Generic list of nodes that exist for the CAN architecture
   * @param nodes List of nodes that are attached to messages and signals
   */
  writeNodes(nodes: string[]) {
    let lineContent = '';
    if (nodes === null || nodes.length === 0) {
      lineContent = `BU_:`;
    } else {
      // TODO: Actually enumerate list out
      lineContent = `BU_: ${nodes.join(' ')}`;
    }
    this.writeLine(lineContent);
    this.writeLine('');
  }

  /**
   * Generic the signal groups as provided from the model
   * @param groups Map of available signal groups to write
   */
  writeSignalGroups(messages: Map<string, Message>) {
    messages.forEach((message: Message) => {
      message.signalGroups.forEach((group: SignalGroup) => {
        const signalList = group.signals.join(' ');
        const lineContent = `SIG_GROUP_ ${group.id} ${group.name} ${group.groupId} : ${signalList};`;
        this.writeLine(lineContent);
      });
    });
    this.writeLine('');
  }

  /**
   *
   * @param message Individual message to be written to the file
   */
  writeMessagesAndSignals(messages: Map<string, Message>) {
    for (const [name, message] of messages) {
      let node;
      if (message.sendingNode) {
        node = message.sendingNode;
      } else {
        // Default that is typically generated from CANDB++ (from Vector)
        node = 'Vector___XXX';
      }
      const lineContent = `BO_ ${message.id.toString()} ${message.name}: ${message.dlc.toString()} ${node}`;
      this.writeLine(lineContent);

      // Extract signals and exand in file
      for (const [signalName, signal] of message.signals) {
        this.writeSignal(signal);
      }
      this.writeLine('');
    }
  }

  /**
   *
   * @param signal Signal to be writen to dbc file
   */
  writeSignal(signal: Signal) {
    const endian = signal.endianness === 'Motorola' ? '0' : '1';
    const sign = signal.signed ? '-' : '+';
    const nodes = signal.receivingNodes.length === 0 ? 'Vector___XXXX' : signal.receivingNodes.join(',');
    const name = signal.multiplex ? signal.name + ' ' + signal.multiplex : signal.name;

    // Format: SG_ Signal0 : 0|32@1- (1,0) [0|0] "" Node1
    const lineContent =
      ` SG_ ` +
      `${name} : ${signal.startBit.toString()}|${signal.length.toString()}@${endian}${sign}` +
      ` (${signal.factor.toString()},${signal.offset.toString()}) [${signal.min.toString()}|${signal.max.toString()}] ` +
      `"${signal.unit}" ${nodes}`;
    this.writeLine(lineContent);
  }

  /**
   * Main writer function for class. New line character will be added automatically
   * to each line, so subsquent calls to this function
   * will automatically start on the next line.
   *
   * @param line Line content to write to file
   * @param skipNextLine If next line should be a blank line
   */
  private writeLine(line: string) {
    fs.writeFileSync(this.file, `${line}\n`, { flag: 'a+' });
  }

  writeBaseComment(comment: string) {
    this.writeLine(`CM_ "${comment}" ;`);
  }

  writeMessageAndSignalComments(messages: Map<string, Message>) {
    for (const [name, msg] of messages) {
      if (msg.description) {
        this.writeLine(`CM_ BO_ ${msg.id.toString()} "${msg.description}" ;`);
      }
      for (const [signalName, signal] of msg.signals) {
        if (signal.description) {
          this.writeLine(`CM_ SG_ ${msg.id.toString()} ${signalName} "${signal.description}" ;`);
        }
      }
    }
  }

  generateEnumTable(tableMembers: ValueTable) {
    let members = '';
    for (const [enumVal, enumName] of tableMembers) {
      members = members + enumVal.toString() + ' ' + `"${enumName}"` + ' ';
    }
    return `${members}`;
  }

  writeValTable(valueTable: Map<string, ValueTable>) {
    for (const [name, tableMembers] of valueTable) {
      const members = this.generateEnumTable(tableMembers);
      const lineContent = `VAL_TABLE_ ${name} ${members};`;
      this.writeLine(lineContent);
    }
    this.writeLine('');
  }

  writeSignalTables(messages: Map<string, Message>) {
    for (const [name, msg] of messages) {
      for (const [signalName, signal] of msg.signals) {
        if (signal.valueTable) {
          const members = this.generateEnumTable(signal.valueTable);
          const lineContent = `VAL_ ${msg.id.toString()} ${signal.name} ${members};`;
          this.writeLine(lineContent);
        }
      }
    }
    this.writeLine('');
  }

  writeEnvVarTables(environmentVariables: Map<string, EnvironmentVariable>) {
    environmentVariables.forEach((ev: EnvironmentVariable) => {
      if (ev.valueTable) {
        const members = this.generateEnumTable(ev.valueTable);
        const lineContent = `VAL_ ${ev.name} ${members};`;
        this.writeLine(lineContent);
      }
    });
  }

  private enumListToString(enumList: string[]) {
    return enumList.reduce((accumulator, currentValue, idx) => {
      let str = '';
      if (idx === 0) {
        str = `"${currentValue.trim()}"`;
      } else {
        str = `, "${currentValue.trim()}"`;
      }
      return accumulator + str;
    }, '');
  }

  private createAttributeDefinitionStr(value: Attribute, type: 'BU_' | 'BO_' | 'SG_' | null): string {
    let lineContent: string;
    if (type) {
      lineContent = `BA_DEF_ ${type} "${value.name}" ${value.dataType}`;
    } else {
      lineContent = `BA_DEF_ "${value.name}" ${value.dataType}`;
    }
    switch (value.dataType) {
      case 'INT':
        lineContent = lineContent + ` ${value.min} ${value.max};`;
        break;
      case 'FLOAT':
        lineContent = lineContent + ` ${value.min} ${value.max};`;
        break;
      case 'ENUM':
        if (value.options) {
          lineContent = lineContent + ' ' + this.enumListToString(value.options) + ';';
        }
        break;
      case 'STRING':
        lineContent = lineContent + ';';
        break;
      case 'HEX':
        lineContent = lineContent + ` ${value.min} ${value.max};`;
        break;
    }
    return lineContent;
  }

  writeAttributeDefinitions(data: DbcData) {
    // Write global attributes
    data.attributes.forEach((value: Attribute, key: string) => {
      this.writeLine(this.createAttributeDefinitionStr(value, null));
    });

    // Write node attributes
    data.nodes.forEach((node) => {
      node.attributes.forEach((value: Attribute, key: string) => {
        this.writeLine(this.createAttributeDefinitionStr(value, 'BU_'));
      });
    });

    // Write message attributes
    const messages = data.messages;
    messages.forEach((message) => {
      message.attributes.forEach((value: Attribute, key: string) => {
        this.writeLine(this.createAttributeDefinitionStr(value, 'BO_'));
      });
    });

    // Write signal attributes
    messages.forEach((message) => {
      const signals = message.signals;
      if (signals) {
        signals.forEach((signal: Signal, key: string) => {
          signal.attributes.forEach((value: Attribute, name: string) => {
            this.writeLine(this.createAttributeDefinitionStr(value, 'SG_'));
          });
        });
      }
    });
    this.writeLine('');
  }

  createAttributeDefaultString(value: Attribute): string {
    let lineContent: string = `BA_DEF_DEF_ "${value.name}"`;
    switch (value.dataType) {
      case 'STRING':
        lineContent = lineContent + ` "${value.defaultValue}";`;
        break;
      case 'ENUM':
        lineContent = lineContent + ` "${value.defaultValue}";`;
        break;
      default:
        lineContent = lineContent + ` ${value.defaultValue};`;
        break;
    }
    return lineContent;
  }

  writeAttributeDefaults(data: DbcData) {
    // Write global attributes
    data.attributes.forEach((value: Attribute, key: string) => {
      this.writeLine(this.createAttributeDefaultString(value));
    });

    // Write node attributes
    data.nodes.forEach((node) => {
      node.attributes.forEach((value: Attribute, key: string) => {
        this.writeLine(this.createAttributeDefaultString(value));
      });
    });

    // Write message attributes
    const messages = data.messages;
    messages.forEach((message) => {
      message.attributes.forEach((value: Attribute, key: string) => {
        this.writeLine(this.createAttributeDefaultString(value));
      });
    });

    // Write signal attributes
    messages.forEach((message) => {
      const signals = message.signals;
      if (signals) {
        signals.forEach((signal: Signal, key: string) => {
          signal.attributes.forEach((value: Attribute, name: string) => {
            this.writeLine(this.createAttributeDefaultString(value));
          });
        });
      }
    });
    this.writeLine('');
  }

  createAttributeValueString(
    value: Attribute,
    type: 'BU_' | 'BO_' | 'SG_' | null,
    id: number | null,
    node: string | null,
    signal: string | null,
  ): string {
    let lineContent: string = `BA_ "${value.name}"`;
    if (!type) {
      if (value.dataType === 'STRING') {
        lineContent = lineContent + ` "${value.value}";`;
      } else {
        lineContent = lineContent + ` ${value.value};`;
      }
      return lineContent;
    }

    // BA_ "BUIntAttribute" BU_ Node0 100;
    // BA_ "BOStringAttribute" BO_ 1234 "MessageAttribute";
    // BA_ "SGEnumAttribute" SG_ 1234 Signal0 2;
    switch (type) {
      case 'BU_':
        if (value.dataType === 'STRING') {
          lineContent = lineContent + ` ${type} ${node} "${value.value}";`;
        } else {
          lineContent = lineContent + ` ${type} ${node} ${value.value};`;
        }
        break;
      case 'BO_':
        if (value.dataType === 'STRING') {
          lineContent = lineContent + ` ${type} ${id} "${value.value}";`;
        } else {
          lineContent = lineContent + ` ${type} ${id} ${value.value};`;
        }
        break;
      case 'SG_':
        if (value.dataType === 'STRING') {
          lineContent = lineContent + ` ${type} ${id} ${signal} "${value.value}";`;
        } else {
          lineContent = lineContent + ` ${type} ${id} ${signal} ${value.value};`;
        }
        break;
    }
    return lineContent;
  }

  writeAttributeValues(data: DbcData) {
    // Write global attributes
    data.attributes.forEach((value: Attribute, key: string) => {
      // skip if default = value so its no double defined in the dbc file output
      if (value.defaultValue !== value.value) {
        this.writeLine(this.createAttributeValueString(value, null, null, null, null));
      }
    });

    // Write node attributes
    data.nodes.forEach((node) => {
      node.attributes.forEach((value: Attribute, key: string) => {
        if (value.defaultValue !== value.value) {
          this.writeLine(this.createAttributeValueString(value, 'BU_', null, node.name, null));
        }
      });
    });

    // Write message attributes
    const messages = data.messages;
    messages.forEach((message) => {
      message.attributes.forEach((value: Attribute, key: string) => {
        if (value.defaultValue !== value.value) {
          this.writeLine(this.createAttributeValueString(value, 'BO_', message.id, null, null));
        }
      });
    });

    // Write signal attributes
    messages.forEach((message) => {
      const signals = message.signals;
      if (signals) {
        signals.forEach((signal: Signal, key: string) => {
          signal.attributes.forEach((value: Attribute, name: string) => {
            if (value.defaultValue !== value.value) {
              this.writeLine(this.createAttributeValueString(value, 'SG_', message.id, null, signal.name));
            }
          });
        });
      }
    });
    this.writeLine('');
  }
}

export default Writer;
