import { DbcData, Message, Signal, EndianType, ValueTable } from '../dbc/types';
import { ASTKinds, ASTNodeIntf,Parser, ParseResult, CanMessage, CanSignal, Version, NewSymbolValue,
Val, ValTable, AttributeValue, AttributeDefault, GlobalAttribute, MessageAttribute, SignalAttribute,
NodeAttribute, Node, Comment, SignalComment } from '../parser/parser';

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
                    break;
                case ASTKinds.AttributeDefault:
                    break;
                case ASTKinds.GlobalAttribute:
                    break;
                case ASTKinds.MessageAttribute:
                    break;
                case ASTKinds.SignalAttribute:
                    break;
                case ASTKinds.NodeAttribute:
                    break;
                case ASTKinds.Node:
                    break;
                case ASTKinds.SignalComment:
                    console.log(this.parseResult.ast);
                    break;
                case ASTKinds.MessageComment:
                    console.log(this.parseResult.ast);
                    break;
                case ASTKinds.NodeComment:
                    console.log(this.parseResult.ast);
                    break;
                case ASTKinds.Comment:
                    this.addComment(data, this.parseResult.ast);
                    break;
            }
        }
        return data;
    }

    /* START OF HELPER FUNCTIONS FOR UPDATEDATA CALLBACK */

    private addComment(dbc: DbcData, data: Comment) {
        dbc.description = data.comment;
    }

    private addMessage(dbc: DbcData, data: CanMessage) {
        const message = {} as Message;
        message.id = data.id;
        message.dlc = data.dlc;
        message.name = data.name;
        message.sendingNode = data.node;
        message.signals = new Map();
        dbc.messages.set(message.name,message);
    }

    private addSignal(dbc: DbcData, data: CanSignal) {
        const signal = {} as Signal;
        signal.name = data.name;
        signal.endianness = data.endian === 'Motorola' ? 'Motorola' : 'Intel';
        signal.startBit = data.start_bit;
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
        /* Signals come directly after a message tag, so we can just append
            the current signal instance to the last message found in the array */
        const messageList = Array.from(dbc.messages.keys());
        const lastKey = messageList[messageList.length - 1];
        let msg: Message | undefined;
        if (dbc.messages.has(lastKey)) {
            msg = dbc.messages.get(lastKey);
            msg?.signals.set(signal.name,signal);
        }
    }

    private addSignalComment(dbc: DbcData, data: SignalComment) {
        
    }

    private addVersion(dbc: DbcData, data: Version) {
        dbc.version = data.version;
    }

    private addNewSymbolValue(dbc: DbcData, data: NewSymbolValue) {
        dbc.newSymbols.push(data.symbol);
    }

    private addVal(dbc: DbcData, data: Val) {
        
        // Need to find specific signal in dataset to append signal table to
        let messageName: string | null = null;
        for (const [key,value] of dbc.messages) {
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
        dbc.valueTables?.set(data.name,table);
    }

    private hasKindProp(obj: unknown): obj is ASTNodeIntf {
        return (
            typeof obj === 'object' && obj !== null && 'kind' in obj
        );
    }
}