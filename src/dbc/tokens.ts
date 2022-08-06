const tokens = {
    VERSION: {
        name: 'version',
        description: 'Version of the document',
        dataFormat: /VERSION "(?<versionNumber>.*)"/,
        tokenStart: null,
        tokenEnd: null,
        multiLine: false,
        multiLineStopToken: null
    },
    NS_: {
        name: 'nameSpace',
        description: 'Defines the list of tokens expected in the document',
        dataFormat: '',
        tokenStart: null,
        tokenEnd: ' :',
        multiLine: true,
        multiLineStopToken: null
    },
    BS_: {
        name: 'busSpeed',
        description: 'Defines the bus speed (kbit)',
        dataFormat: '',
        tokenStart: null,
        tokenEnd: null,
        multiLine: false,
        multiLineStopToken: null
    },

}

export default tokens