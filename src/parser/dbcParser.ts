import { DbcData, Message, Signal, EndianType } from '../dbc/types';
import { ASTKinds, ASTNodeIntf,Parser, ParseResult, CanMessage, CanSignal, Version, NewSymbolValue,
Val, ValTable, AttributeValue, AttributeDefault, GlobalAttribute, MessageAttribute, SignalAttribute,
NodeAttribute, Node } from '../parser/parser';

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
                    break;
                case ASTKinds.NewSymbolValue:
                    break;
                case ASTKinds.Val:
                    break;
                case ASTKinds.ValTable:
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
                    break;
                case ASTKinds.MessageComment:
                    break;
                case ASTKinds.NodeComment:
                    break;
            }
        } else {
            
        }
        return data;
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

    protected hasKindProp(obj: unknown): obj is ASTNodeIntf {
        return (
            typeof obj === 'object' && obj !== null && 'kind' in obj
        );
    }
}