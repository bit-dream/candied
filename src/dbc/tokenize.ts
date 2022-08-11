/**
 * 
 * Utility class that main the DBC class will extend from to provide
 * tokenization and parsing utility functions
 * 
 */

import { 
    Token, Tokens, Message, Signal, 
    MessageRegex, SignalRegex, VersionRegex, 
    CanConfigRegex, CanNodesRegex, DbcData 
} from './types';
import tokens from './tokens';

class Tokenize {
    tokens: Tokens;

    constructor() {
        this.tokens = tokens;
    }

    addToken(tokenName: string, tokenData: Token) {
        this.tokens[tokenName] = tokenData;
    }

    /**
     * 
     * @param line Raw line from dbc file
     * @returns {
          line: line,
          baseToken: foundToken,
          regexMatch: regexMatch,
        }
     */
    protected parseLine(line: string) {
        const baseTokens = Object.keys(this.tokens);
    
        let foundToken: string | null = null;
        let regexMatch = null;
        baseTokens.forEach((token) => {
          if (line.startsWith(token)) {
            foundToken = token;
            regexMatch = [line.match(this.tokens[token].dataFormat)];
            return;
            // Catch indented tokens
          } else if (line.trimStart().startsWith(token) && token === 'SG_') {
            foundToken = token;
            regexMatch = [line.match(this.tokens[token].dataFormat)];
            return;
          }

          // TODO: Do exception handling for when line doesn't have token
        });
        
        return {
          line: line,
          baseToken: foundToken,
          regexMatch: regexMatch,
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
                const msg = data.messages.get(lastKey);
                msg?.signals.set(groups.name, this.parseSignal(groups));
            }
            break;
            case 'BU_':
            data.canNodes = this.parseCanNodes(groups);
            case 'BS_':
            data.busConfiguration = this.parseCanConfiguration(groups);
            default:
            break;
        }
        }
        return data;
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
            endianness: obj.endian,
            signed: (obj.signed === '+') ? true : false,
            factor: parseInt(obj.factor, 10),
            offset: parseInt(obj.offset, 10),
            min: parseInt(obj.min, 10),
            max: parseInt(obj.max, 10),
            unit: obj.unit,
            receivingNodes: obj.receivingNodes.trim().split(' '),
            description: null
        };
        return signal;
    }

    protected parseVersion(obj: VersionRegex) {
        const version: string = obj.version;
        return version;
    }

    protected parseCanNodes(obj: CanNodesRegex) {
        const canNodes: Array<string> = obj.nodes.trim().split(' ');
        return canNodes;
    }

    protected parseCanConfiguration(obj: CanConfigRegex) {
        const busConfiguration: number = parseInt(obj.speed, 10);
        return busConfiguration;
    }
}

export default Tokenize;