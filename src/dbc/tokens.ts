const baseTokens = {
    VERSION: {
        name: 'version',
        description: 'Version of the document',
        dataFormat: `VERSION "(?P<versionNumber>.*)"`,
        tokenStart: null,
        tokenEnd: null,
        multiLine: false
    },
    NS_: {
        name: 'nameSpace',
        description: 'Defines the list of tokens expected in the document',
        dataFormat: '',
        tokenStart: null,
        tokenEnd: ' :',
        multiLine: true
    },
    BS_: {
        name: 'busSpeed',
        description: 'Defines the bus speed (kbit)',
        dataFormat: '',
        tokenStart: null,
        tokenEnd: null,
        multiLine: false
    },

}

export default baseTokens