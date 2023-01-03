/**
 * Utility function for unloading the raw contents of a DBC file into a string that can
 * then be passed to the .load function provided by the Dbc class.
 *
 * @param file File to unload
 * @param onLoad Optional callback function that can be provided that will be called after
 * file has been loaded. Function is provided the raw contents of the file so that it can be used
 * in the callback
 */
export const dbcReader = (file: File, onLoad?: (content: string) => void) => {
  if (file.name.endsWith('.dbc')) {
    const reader = new FileReader();

    // Set the onload event handler
    reader.onload = (event: ProgressEvent<FileReader>) => {
      // Get the file contents
      if (event && event.target) {
        event.preventDefault();
        const fileContents = event.target.result as string;
        if (onLoad) {
          onLoad(fileContents);
        }
      }
    };
    // Read the file contents
    return reader.readAsText(file);
  }
};
