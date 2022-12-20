import path from 'path';
import { IncorrectFileExtension } from '../dbc/Errors';

/**
 * Determines if the containing filepath has the correct extension
 *
 * @param file Filepath
 * @param ext File extension to check against
 */
export const validateFileExtension = (file: string, ext: string): void => {
  const fileExt = path.extname(file);
  if (fileExt !== ext) {
    throw new IncorrectFileExtension(`Function expected a file extension of '.dbc', got ${fileExt}`);
  }
};
