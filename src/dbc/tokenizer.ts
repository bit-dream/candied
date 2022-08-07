import tokens from "./tokens";

const tokenizeLine = (line: string, lineNumber: any) => {
    const baseTokens = Object.keys(tokens);
    
    let foundToken = null;
    baseTokens.forEach(token => {
        if (line.startsWith(token)) {
            foundToken = token;
            return;
        }
    })

    return {
        line: line,
        lineNumber: lineNumber,
        foundBaseToken: foundToken,
        subTokens: null
    }
};

const pullOutSubTokens = (token: any, line: string) => {
    
}

const multiLineToken = () => {

}

export default tokenizeLine