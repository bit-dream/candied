import fs from 'fs';
import { validateFileExtension } from './FileHandlers';

/**
 * Utility function for Node that allows you to read in a dbc file and output a raw string that can be loaded into
 * the Dbc classes .load function.
 * @param file File to unload
 */
const dbcReader = (file: string) => {
  validateFileExtension(file, '.dbc');
  return fs.readFileSync(file, { encoding: 'ascii' });
};
export default dbcReader;
