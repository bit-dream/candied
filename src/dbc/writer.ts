import * as fs from 'fs';
import { DbcData, Message, Signal } from './types';

class Writer {
    file: string;
    constructor(file: string, overwrite = false) {
        this.file = file;
    }

    /**
     * 
     * @param data dbc data loaded or created using main DBC class
     */
    constructFile(data: DbcData) {
        this.writeVersion(data.version ? data.version : '');
        this.writeNamespace();
        this.writeBusSpeed(data.busConfiguration);
        this.writeNodes(data.canNodes);
        for (const [name, message] of data.messages) {
            this.writeMessage(message);
        }
        if (data.description) {this.writeBaseComment(data.description);};
    };
    private writeVersion(version: string) {
        const lineContent = `VERSION "${version}"`
        this.writeLine(lineContent, true);
    };
    private writeNamespace(ns: (string)[] | null = null) {
        // TODO: For now since name space technically doesn't need
        // to be complete for a valid DBC file, we will skip it's content
        const lineContent = `NS_:`;
        this.writeLine(lineContent, true);
    };
    private writeBusSpeed(busConfiguration: number | null) {
        let lineContent = '';
        if (busConfiguration === null) {
            lineContent = `BS_:`;
        } else {
            lineContent = `BS_: ${busConfiguration}`;
        }
        this.writeLine(lineContent, true);
    };
    private writeNodes(nodes: (string)[]) {
        let lineContent = '';
        if (nodes === null || nodes.length === 0) {
            lineContent = `BU_:`;
        } else {
            // TODO: Actually enumerate list out
            lineContent = `BU_:`;
        }
        this.writeLine(lineContent, true);
    };
    private writeMessage(message: Message) {
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
    };

    private writeSignal(signal: Signal) {
        let endian;
        if (signal.endianness === 'Motorola') {
            endian = '0';
        } else {
            endian = '1';
        }
        let sign;
        if (signal.signed) {
            sign = '+';
        } else {
            sign = '-';
        }
        let nodes: string;
        if (signal.receivingNodes.length === 0) {
            nodes = 'Vector___XXXX';
        } else {
            nodes = signal.receivingNodes.join(' ');
        }
        // Format: SG_ Signal0 : 0|32@1- (1,0) [0|0] "" Node1
        // TODO: Add support for multiplexors
        const lineContent =
        ` SG_ ` + `${signal.name} : ${signal.startBit.toString()}|${signal.length.toString()}@${endian}${sign}` +
        `(${signal.factor.toString()},${signal.offset.toString()}) [${signal.min.toString()}|${signal.max.toString()}] ` +
        `"${signal.unit}" ${nodes}`;
        this.writeLine(lineContent);
    };

    private writeLine(line: string, skipNextLine: boolean = false) {
        fs.writeFileSync(
            this.file, 
            skipNextLine ? `${line}\n\n` : `${line}\n`, 
            { flag: 'a+' }
        );
    };

    private writeBaseComment(comment: string) {
        this.writeLine(`CM_ "${comment}" ;`)
    }

    private writeSignalComment(comment: string, message: string, signal: Signal) {
        this.writeLine(`CM_ SG_ ${''} ${''} "${comment}" ;`)
    }

};

export default Writer;