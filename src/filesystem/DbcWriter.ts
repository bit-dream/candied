import fs from 'fs';
import { validateFileExtension } from './FileHandlers';

/**
 * Utility function for writing a raw dbc string to a .dbc file
 * @param file location and name of the dbc file to write to
 * @param fileContent The DBC content that will be loaded into the file
 */
const dbcWriter = (file: string, fileContent: string) => {
  validateFileExtension(file, '.dbc');
  fs.writeFileSync(file, '', { flag: 'w+' });
  const lines = fileContent.split('\n');

  for (const line of lines) {
    fs.writeFileSync(file, `${line}\n`, { flag: 'a+' });
  }
};
export default dbcWriter;
