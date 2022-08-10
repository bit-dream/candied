/**
 * 
 * Public defined list of tokens as defined by the DBC specification with
 * their relative regex data formats
 */
const tokens = {
  VERSION: {
    name: 'version',
    dataFormat: /VERSION "(?<version>.*)"/
  },
  NS_: {
    name: 'namespace',
    dataFormat: /NS_/
  },
  /*
        Defines the bus speed (kbit)
    */
  BS_: {
    name: 'speed',
    dataFormat: /BS_: (?<speed>.*)/
  },
  /*
        Defines the list of CAN nodes
        List seperated by whitespace
    */
  BU_: {
    name: 'nodes',
    dataFormat: /BU_:(?<nodes> .* ?)/
  },
  /* 
        Defines the data object (message) that contains individual signals
        <CAN-ID> <MessageName>: <MessageLength> <SendingNode> 
    */
  BO_: {
    name: 'message',
    dataFormat: /BO_ (?<id>\d*) (?<messageName>.*): (?<dlc>\d) (?<sendingNode>.*)/
  },
  SG_: {
    name: 'signal',
    dataFormat:
      /\s*SG_ (?<name>([a-zA-Z0-9]+))\s?(?<plex>.*) : (?<startBit>\d{1,2})\|(?<length>\d{1,2})@(?<endian>\d)(?<signed>.) \((?<factor>.*),(?<offset>.*)\) \[(?<min>.*)\|(?<max>.*)\] "(?<unit>.*)" (?<receivingNodes>.*)/,
  },
  CM_: {
    name: 'description',
    dataFormat: /CM_/
  },
  BA_DEF_: {
    name: 'attribute',
    dataFormat: /BA_DEF_/
  },
  BA_: {
    name: 'attributeValue',
    dataFormat: /BA_/
  },
  VAL_: {
    name: 'busSpeed',
    dataFormat: /VAL_/
  },
  VAL_TABLE_: {
    name: 'busSpeed',
    dataFormat: /VAL_TABLE/
  },
  BO_TX_BU_: {
    name: 'busSpeed',
    dataFormat: /BO_TX_BU_/
  },
  SIG_GROUP_: {
    name: 'busSpeed',
    dataFormat: /SIG_GROUP_/
  }
};

export default tokens;
