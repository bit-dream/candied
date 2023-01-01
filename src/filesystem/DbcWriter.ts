import fs from "fs";
import {validateFileExtension} from "./FileHandlers";

const dbcWriter = (file: string, fileContent: string) => {
    validateFileExtension(file,'.dbc');
    fs.writeFileSync(file, '', { flag: 'w+' });
    const lines = fileContent.split('\n');

    for (const line of lines) {
        fs.writeFileSync(file, `${line}\n`, { flag: 'a+' });
    }
}
export default dbcWriter;