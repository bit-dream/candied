import tokens from "./tokens";

const tokenizeLine = (line: string, lineNumber: any) => {
    const baseTokens = Object.keys(tokens);
    
    // Check whether the line starts with one of the base level tokens
    let lineContainsToken = false;
    let foundToken = null;
    baseTokens.forEach(token => {
        if (line.startsWith(token)) {
            lineContainsToken = true;
            foundToken = token;
        }
    })

    return {
        line: line,
        lineNumber: lineNumber,
        foundBaseToken: foundToken,
        subTokens: null
    }
};

export default tokenizeLine