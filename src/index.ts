import { readFileLines } from './rawDbcReader'
import tokens from './dbc/tokens'
import tokenizeLine from './dbc/tokenizer';


const baseTokens = Object.keys(tokens);
readFileLines(
    '/Users/headquarters/Documents/Code/can-dbc/src/__tests__/testFiles/DBC_template.dbc',
    (line: string, lineNumber: any) => {
        let params = tokenizeLine(line,lineNumber);
        console.log(params)
    }
);