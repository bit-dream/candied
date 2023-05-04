import { AttributeType } from '../dbc/DbcTypes';

export function table2Enum(table: string): Map<number, string> {
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
  const noSemiColon = comment.replace(';', '');
  const final = noSemiColon.replace(/"/gi, '');
  return final.trim();
}

export function extractAttrType(str: string): AttributeType {
  const match = str.match(/BO_|BU_|SG_|EV_/);
  if (match) {
    switch (match?.toString()) {
      case 'BO_':
        return 'Message';
      case 'BU_':
        return 'Node';
      case 'SG_':
        return 'Signal';
      case 'EV_':
        return 'EnvironmentVariable';
      default:
        return 'Global';
    }
  } else {
    return 'Global';
  }
}

export function extractAttrNode(type: string, str: string): string {
  let matches: RegExpMatchArray | null;
  switch (type) {
    case 'Message':
      return '';
    case 'Signal':
      return '';
    case 'Node':
      matches = str.match(/BU_\s(?<node>[a-zA-Z0-9_]+)\s(?<value>.*)\s*;/);
      if (matches) {
        if (matches.groups) {
          return matches.groups.node;
        }
      }
    case 'Global':
      return '';
    case 'EnvironmentVariable':
      matches = str.match(/EV_\s(?<node>[a-zA-Z0-9_]+)\s(?<value>.*)\s*;/);
      if (matches) {
        if (matches.groups) {
          return matches.groups.node;
        }
      }
    default:
      return '';
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
    case 'EnvironmentVariable':
      matches = str.match(/EV_\s(?<node>[a-zA-Z0-9_]+)\s(?<value>.*)\s*;/);
      if (matches) {
        if (matches.groups) {
          return cleanComment(matches.groups.value);
        }
      }
    default:
      return '';
  }
}

export function extractAttrSignalName(type: string, str: string): string {
  let matches: RegExpMatchArray | null;
  let signalName = '';
  switch (type) {
    case 'Message':
      break;
    case 'Signal':
      matches = str.match(/SG_\s(?<id>[0-9]+)\s(?<signalName>[a-zA-Z0-9_]+)\s(?<value>.*);/);
      if (matches) {
        if (matches.groups) {
          signalName = matches.groups.signalName;
        }
      }
      break;
    case 'Node':
      break;
    case 'Global':
      break;
    default:
      break;
  }
  return signalName;
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
      return '';
    case 'Global':
      return '';
    default:
      return '';
  }
}

export function extractMinVal(type: string, str: string): number {
  let min = 0;
  switch (type) {
    case 'FLOAT':
      const floatMatches = str.match(/\s*(?<min>[0-9.]+)\s(?<max>[0-9.]+)\s*;/);
      if (floatMatches && floatMatches.groups) {
        min = parseFloat(floatMatches.groups.min);
      }
      break;
    case 'STRING':
      break;
    case 'HEX':
      const hexMatches = str.match(/\s*(?<min>[0-9.]+)\s(?<max>[0-9.]+)\s*;/);
      if (hexMatches && hexMatches.groups) {
        min = parseFloat(hexMatches.groups.min);
      }
      break;
    case 'ENUM':
      break;
    case 'INT':
      const intMatches = str.match(/\s*(?<min>[0-9.]+)\s(?<max>[0-9.]+)\s*;/);
      if (intMatches && intMatches.groups) {
        min = parseFloat(intMatches.groups.min);
      }
      break;
    default:
      break;
  }
  return min;
}

export function extractMaxVal(type: string, str: string): number {
  let max = 0;
  switch (type) {
    case 'FLOAT':
      const floatMatches = str.match(/\s*(?<min>[0-9.]+)\s(?<max>[0-9.]+)\s*;/);
      if (floatMatches && floatMatches.groups) {
        max = parseFloat(floatMatches.groups.max);
      }
      break;
    case 'STRING':
      break;
    case 'HEX':
      const hexMatches = str.match(/\s*(?<min>[0-9.]+)\s(?<max>[0-9.]+)\s*;/);
      if (hexMatches && hexMatches.groups) {
        max = parseFloat(hexMatches.groups.max);
      }
      break;
    case 'ENUM':
      break;
    case 'INT':
      const intMatches = str.match(/\s*(?<min>[0-9.]+)\s(?<max>[0-9.]+)\s*;/);
      if (intMatches && intMatches.groups) {
        max = parseFloat(intMatches.groups.max);
      }
      break;
    default:
      break;
  }
  return max;
}

export function extractOptions(type: string, str: string): string[] {
  if (type !== 'ENUM') {
    return [];
  }
  const newStr = str.replace(';', '');
  const strArr = newStr.split(',');
  const final = strArr.map((s: string) => {
    return s.replace(/"/gi, '').trim();
  });
  return final;
}
