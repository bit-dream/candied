/**
 * 
 * Base exception and errors that program can throw
 * 
 */

class LineDoesNotContainToken extends Error {
    __proto__ = Error
    constructor(lineNumber: number, message: string) {
        super(message);
        Object.setPrototypeOf(this, LineDoesNotContainToken.prototype);
    }
}