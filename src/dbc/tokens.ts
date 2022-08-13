/**
 *
 * Public defined list of tokens as defined by the DBC specification with
 * their relative regex data formats
 */
const tokens = {
  VERSION: {
    name: 'version',
    dataFormat: /VERSION "(?<version>.*)"/,
  },
  NS_: {
    name: 'namespace',
    dataFormat: /NS_/,
  },
  /*
        Defines the bus speed (kbit)
    */
  BS_: {
    name: 'speed',
    dataFormat: /BS_: (?<speed>.*)/,
  },
  /*
        Defines the list of CAN nodes
        List seperated by whitespace
    */
  BU_: {
    name: 'nodes',
    dataFormat: /BU_:(?<nodes> .* ?)/,
  },
  /* 
        Defines the data object (message) that contains individual signals
        <CAN-ID> <MessageName>: <MessageLength> <SendingNode> 
    */
  BO_: {
    name: 'message',
    dataFormat: /BO_ (?<id>\d*) (?<messageName>.*): (?<dlc>\d) (?<sendingNode>.*)/,
  },
  SG_: {
    name: 'signal',
    dataFormat:
      /\s*SG_ (?<name>([a-zA-Z0-9_]+))\s?(?<plex>.*) : (?<startBit>\d{1,2})\|(?<length>\d{1,2})@(?<endian>\d)(?<signed>.) \((?<factor>.*),(?<offset>.*)\) \[(?<min>.*)\|(?<max>.*)\] "(?<unit>.*)" (?<receivingNodes>.*)/,
  },
  BA_: {
    name: 'attributeValue',
    dataFormat: /BA_/,
  },
  VAL_: {
    name: 'signalValue',
    dataFormat: /VAL_ (?<id>\d+) (?<name>[a-zA-Z0-9_]+) (?<definition>.*);/,
  },
  VAL_TABLE_: {
    name: 'tableValue',
    dataFormat: /VAL_TABLE_ (?<name>[a-zA-Z0-9_]+) (?<definition>.*);/,
  },
  CM_: {
    name: 'comment',
    dataFormat: /CM_ "(?<comment>.*)"/,
  },
  'CM_ SG_': {
    name: 'signalComment',
    dataFormat: /CM_ SG_ (?<id>.*) (?<name>.*) "(?<comment>.*)"/,
  },
  'CM_ BU_': {
    name: 'nodeComment',
    dataFormat: /CM_ BU_ (?<node>.*) "(?<comment>.*)"/,
  },
  'CM_ BO_': {
    name: 'messageComment',
    dataFormat: /CM_ BO_ (?<id>.*) "(?<comment>.*)"/,
  },
};

export default tokens;
