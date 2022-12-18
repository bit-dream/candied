/**
 *
 * Base exception and errors that program can throw
 *
 */

/* tslint:disable:max-classes-per-file */
/* tslint:disable:variable-name */

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
    Object.setPrototypeOf(this, ParseError.prototype);
  }
}

export class TokenError extends Error {
  __proto__ = Error;
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, TokenError.prototype);
  }
}

export class InvalidPayloadLength extends Error {
  __proto__ = Error;
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidPayloadLength.prototype);
  }
}

export class SignalDoesNotExist extends Error {
  __proto__ = Error;
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, SignalDoesNotExist.prototype);
  }
}

export class IncorrectFileExtension extends Error {
  __proto__ = Error;
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, IncorrectFileExtension.prototype);
  }
}
