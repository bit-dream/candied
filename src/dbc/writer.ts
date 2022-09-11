import * as fs from 'fs';
import { DbcData, Message, Signal, ValueTable } from './types';

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

        // Main file attributes
        this.writeVersion(data.version ? data.version : '');
        this.writeNamespace();
        this.writeBusSpeed(data.busConfiguration);
        this.writeNodes(data.canNodes);

        // Both messages and signals
        this.writeMessagesAndSignals(data.messages);

        // Write all comments
        if (data.description) {this.writeBaseComment(data.description);};
        this.writeMessageAndSignalComments(data.messages);

        if (data.valueTables) {this.writeValTable(data.valueTables)}
        this.writeSignalTables(data.messages);
    };

    /**
     * 
     * @param version Version of the dbc file
     */
    private writeVersion(version: string) {
        const lineContent = `VERSION "${version}"`
        this.writeLine(lineContent);
        this.writeLine('');
    };

    private writeNamespace(ns: (string)[] | null = null) {
        // TODO: For now since name space technically doesn't need
        // to be complete for a valid DBC file, we will skip it's content
        // and just render the main token
        const lineContent = `NS_:`;
        this.writeLine(lineContent);
        this.writeLine('');
    };

    /**
     * Speed of the CAN bus, typically expressed as 250, 500, etc
     * @param busConfiguration Speed of the CAN bus
     */
    private writeBusSpeed(busConfiguration: number | null) {
        let lineContent = '';
        if (busConfiguration === null) {
            lineContent = `BS_:`;
        } else {
            lineContent = `BS_: ${busConfiguration}`;
        }
        this.writeLine(lineContent);
        this.writeLine('');
    };

    /**
     * Generic list of nodes that exist for the CAN architecture
     * @param nodes List of nodes that are attached to messages and signals
     */
    private writeNodes(nodes: (string)[]) {
        let lineContent = '';
        if (nodes === null || nodes.length === 0) {
            lineContent = `BU_:`;
        } else {
            // TODO: Actually enumerate list out
            lineContent = `BU_:`;
        }
        this.writeLine(lineContent);
        this.writeLine('');
    };

    /**
     * 
     * @param message Individual message to be written to the file
     */
    private writeMessagesAndSignals(messages: Map<string,Message>) {
        for (const [name, message] of messages) {
            let node;
            if (message.sendingNode) {
                node = message.sendingNode
            } else {
                // Default that is typically generated from CANDB++ (from Vector)
                node = 'Vector___XXX'
            }
            let lineContent = `BO_ ${message.id.toString()} ${message.name}: ${message.dlc.toString()} ${node}`;
            this.writeLine(lineContent);

            // Extract signals and exand in file
            for (const [name, signal] of message.signals) {
                this.writeSignal(signal);
            }
            this.writeLine('')
        }
    };

    /**
     * 
     * @param signal Signal to be writen to dbc file
     */
    private writeSignal(signal: Signal) {

        let endian = (signal.endianness === 'Motorola') ? '0': '1';
        let sign = signal.signed ? '+' : '-';
        let nodes = (signal.receivingNodes.length === 0) ? 'Vector___XXXX': signal.receivingNodes.join(' ');
        let name = signal.multiplex ? signal.name + ' ' + signal.multiplex: signal.name;

        // Format: SG_ Signal0 : 0|32@1- (1,0) [0|0] "" Node1
        const lineContent =
        ` SG_ ` + `${name} : ${signal.startBit.toString()}|${signal.length.toString()}@${endian}${sign}` +
        ` (${signal.factor.toString()},${signal.offset.toString()}) [${signal.min.toString()}|${signal.max.toString()}] ` +
        `"${signal.unit}" ${nodes}`;
        this.writeLine(lineContent);
    };

    /**
     * Main writer function for class. New line character will be added automatically
     * to each line, so subsquent calls to this function
     * will automatically start on the next line.
     * 
     * @param line Line content to write to file
     * @param skipNextLine If next line should be a blank line
     */
    private writeLine(line: string) {
        fs.writeFileSync(
            this.file, 
            `${line}\n`, 
            { flag: 'a+' }
        );
    };

    private writeBaseComment(comment: string) {
        this.writeLine(`CM_ "${comment}" ;`)
    }

    private writeMessageAndSignalComments(messages: Map<string,Message>) {
        for (const [name, msg] of messages) {
            if (msg.description) {
                this.writeLine(`CM_ BO_ ${msg.id.toString()} "${msg.description}" ;`)
            }
            for (const [name, signal] of msg.signals) {
                if (signal.description) {
                    this.writeLine(`CM_ SG_ ${msg.id.toString()} ${name} "${signal.description}" ;`)
                }
            }
        }
    }

    private generateEnumTable(tableMembers: ValueTable) {
        let members = ''
        for (const [enumVal, enumName] of tableMembers) {
            members = members + enumVal.toString() + ' ' + `"${enumName}"` + ' ';
        }
        return `${members}`
    }

    private writeValTable(valueTable: Map<string, ValueTable>) {
        for (const [name, tableMembers] of valueTable) {
            let members = this.generateEnumTable(tableMembers);
            let lineContent = `VAL_TABLE_ ${name} ${members};`
            this.writeLine(lineContent);
        }
        this.writeLine('');
    }

    private writeSignalTables(messages: Map<string,Message>) {
        for (const [name, msg] of messages) {
            for (const [name, signal] of msg.signals) {
                if (signal.valueTable) {
                    let members = this.generateEnumTable(signal.valueTable);
                    let lineContent =  `VAL_ ${msg.id.toString()} ${signal.name} ${members};`;
                    this.writeLine(lineContent);
                }
            }
        }
        this.writeLine('');
    }

};

export default Writer;