import readFileLines from "./rawDbcReader";
import tokens from "./tokens";
const fs = require('fs');
const readline = require('readline');


interface Signal {
    name: string;
    multiplexed: boolean;
    multiplexerIdentifier: string | null;
    startBit: number;
    length: number;
    endianness: string;
    signed: boolean;
    factor: number;
    offset: number;
    min: number;
    max: number;
    unit: string;
    receivingNodes: Array<string>;
    description: string | null;
}

interface Message {
    name: string;
    id: number;
    dlc: number;
    sendingNode: string;
    signals: Array<Signal>;
    description: string | null;
}

interface DbcData {
    version: string | null;
    messages: Array<Message>;
    description: string | null;
    namespace: Array<string>;
    busConfiguration: string | null;
    canNodes: Array<string>;
}

class Dbc {

    dbcFile: string;
    tokens: any;
    data: DbcData;

    constructor(file: string) {
        this.dbcFile = file;
        this.tokens = tokens;

        this.data = {
            version: null,
            messages: new Array(),
            description: null,
            namespace: new Array(),
            busConfiguration: null,
            canNodes: new Array()
        }
    };

    async load() {
        const fileStream = fs.createReadStream(this.dbcFile);

        // Note: we use the crlfDelay option to recognize all instances of CR LF
        // ('\r\n') in input.txt as a single line break.
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let lineInfo = null;
        let data: DbcData = {
            version: null,
            messages: new Array(),
            description: null,
            namespace: new Array(),
            busConfiguration: null,
            canNodes: new Array()
        }
        for await (const line of rl) {
            lineInfo = this.basicTokenization(line, this.tokens);
            data = this.addToDataTable(lineInfo, this.tokens, data)
        }

        // Add table data to class instance for future referencing
        this.data = data;
        return data
    };

    basicTokenization(line: string, tokens: any) {
        const baseTokens = Object.keys(tokens);
    
        let foundToken = null; 
        let messageTokens = null;
        baseTokens.forEach(token => {
            if (line.startsWith(token)) {
                foundToken = token;
                messageTokens = [line.match(this.tokens[token].dataFormat)];
                return;
            // Catch indented tokens
            } else if (line.startsWith(token,4) && token === 'SG_') {
                foundToken = token;
                messageTokens = [line.match(this.tokens[token].dataFormat)];
                return;
            }
        })

        return {
            line: line,
            baseToken: foundToken,
            messageTokens: messageTokens
        }
    };

    addToDataTable(lineInfo: any, tokens: any, data: DbcData) {
        if (lineInfo.baseToken !== null) {
            const baseTokens = Object.keys(tokens);
            let groups = null;
            switch (lineInfo.baseToken) {
                case 'VERSION':
                    groups = lineInfo.messageTokens[0].groups;
                    // TODO: Enforce array length should be one for this token set
                    data.version = groups.version;
                    break;
                case 'BO_':
                    groups = lineInfo.messageTokens[0].groups;
                    let message: Message = {
                        name: groups.messageName,
                        id: groups.id,
                        dlc: groups.dlc,
                        sendingNode: groups.sendingNode,
                        signals: [],
                        description: null
                    }
                    data.messages.push(message);
                    break;
                case 'SG_':
                    //Signals come directly after a message tag, so we can just append
                    //the current signal instance to the last message found in the array
                    try {
                        groups = lineInfo.messageTokens[0].groups;
                    } catch (error) {
                        break;
                    }
                    message = data.messages[data.messages.length - 1];
                    let signal: Signal = {
                        name: groups.name,
                        multiplexed: false,
                        multiplexerIdentifier: 'hello',
                        startBit: 0,
                        length: 0,
                        endianness: 'motorola',
                        signed: false,
                        factor: 0,
                        offset: 0,
                        min: 0,
                        max: 0,
                        unit: 'Hello',
                        receivingNodes: [],
                        description: ''
                    }
                    message.signals.push(signal)
                    break;
                default:
                    break;
            }
        }
        return data
    }

    addToken() {
        // TODO
    };



};

export default Dbc