/**
 *
 * Base exception and errors that program can throw
 *
 */

export class LineDoesNotContainToken extends Error {
  __proto__ = Error;
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, LineDoesNotContainToken.prototype);
  }
}

export class MessageDoesNotExist extends Error {
  __proto__ = Error;
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, MessageDoesNotExist.prototype);
  }
}

export class ParseError extends Error {
  __proto__ = Error;
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, MessageDoesNotExist.prototype);
  }
}

export class TokenError extends Error {
  __proto__ = Error;
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, MessageDoesNotExist.prototype);
  }
}
