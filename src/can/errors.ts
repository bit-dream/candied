/**
 *
 * Base exception and errors that program can throw
 *
 */

/* tslint:disable:max-classes-per-file */
/* tslint:disable:variable-name */

export class InvalidPayloadLength extends Error {
  __proto__ = Error;
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidPayloadLength.prototype);
  }
}
