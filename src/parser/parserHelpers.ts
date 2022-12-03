export function tableSpread(table: any) {
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