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

export function extractAttrType(str: string): string {
  const match = str.match(/BO_|BU_|SG_/)
  if (match) {
    switch (match?.toString()) {
      case 'BO_':
        return 'Message';
      case 'BU_':
        return 'Node';
      case 'SG_':
        return 'Signal';
      default:
        return 'Global';
    }
  } else {
    return 'Global'
  }
}

export function extractAttrNode(type: string, str: string): string {
  let matches: RegExpMatchArray | null;
  switch (type) {
    case 'Message':
      return ''
    case 'Signal':
      return ''
    case 'Node':
      matches = str.match(/BU_\s(?<node>[a-zA-Z0-9_]+)\s(?<value>.*)\s*;/);
      if (matches) {
        if (matches.groups) {
          return matches.groups.node;
        }
      }
    case 'Global':
      return ''
    default:
      return ''
  }
}

export function extractAttrVal(type: string, str: string): string {
  let matches: RegExpMatchArray | null;
  switch (type) {
    case 'Message':
      matches = str.match(/BO_\s(?<id>[0-9]+)\s(?<value>.*);/);
      if (matches) {
        if (matches.groups) {
          return cleanComment(matches.groups.value);
        }
      }
    case 'Signal':
      matches = str.match(/SG_\s(?<id>[0-9]+)\s(?<signalName>[a-zA-Z0-9_]+)\s(?<value>.*);/);
      if (matches) {
        if (matches.groups) {
          return cleanComment(matches.groups.value);
        }
      }
    case 'Node':
      matches = str.match(/BU_\s(?<node>[a-zA-Z0-9_]+)\s(?<value>.*)\s*;/);
      if (matches) {
        if (matches.groups) {
          return cleanComment(matches.groups.value);
        }
      }
    case 'Global':
      matches = str.match(/(?<value>.*)\s*;/);
      if (matches) {
        if (matches.groups) {
          return cleanComment(matches.groups.value);
        }
      }
    default:
      return ''
  }
}

export function extractAttrId(type: string, str: string): string {
  let matches: RegExpMatchArray | null;
  switch (type) {
    case 'Message':
      matches = str.match(/BO_\s(?<id>[0-9]+)\s(?<value>.*);/);
      if (matches) {
        if (matches.groups) {
          return matches.groups.id;
        }
      }
    case 'Signal':
      matches = str.match(/SG_\s(?<id>[0-9]+)\s(?<signalName>[a-zA-Z0-9_]+)\s(?<value>.*);/);
      if (matches) {
        if (matches.groups) {
          return matches.groups.id;
        }
      }
    case 'Node':
      return ''
    case 'Global':
      return ''
    default:
      return ''
  }
}