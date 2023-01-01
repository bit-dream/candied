import fs from 'fs';
import { validateFileExtension } from './FileHandlers';

const dbcReader = (file: string) => {
  validateFileExtension(file, '.dbc');
  return fs.readFileSync(file, { encoding: 'ascii' });
};
export default dbcReader;
