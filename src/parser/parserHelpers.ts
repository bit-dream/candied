export function table2Enum(table: string): Map<number,string> {
    const regEx = /(?<value>[0-9-]+) "(?<description>(?:[^"\\]|\\.)*)"/gi;
    const matches = table.matchAll(regEx);
    const definitions = new Map();

    for (const match of matches) {
      if (match.groups) {
        definitions.set(parseInt(match.groups.value, 10), match.groups.description);
      }
    }
    return definitions;
  }

export function cleanComment(comment: string): string {
  let noSemiColon = comment.replace(';','');
  let final = noSemiColon.replace(/"/gi,'');
  return final;
}