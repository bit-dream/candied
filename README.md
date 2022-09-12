# CAN-DBC
### A zero dependency, lightly weight parser, written in pure Javascript/Typescript

## Motivation
### What is a DBC file?
The DBC file is an ASCII based translation file used to apply identifying names, scaling, offsets, and defining information, to data transmitted within a CAN frame. 

Simply put, it helps decode raw CAN (Controller Area Network) frames into something that is human readable.

### What are the goals of CAN-DBC
To develop and deploy a very simple, lightweight library that doesn't relay on external dependecies.
You should be able to do the following with this library:
1. Load and parse a .dbc file so that its contents can be analysed (messages, signals, etc.)
2. Create your own .dbc file by creating messages, signals, value tables, enumerations.
3. Decode individual CAN frames into human readable content.
4. Encode to a raw CAN frame from a DBC message
5. Use utility functions to help analyize DBC files.

As of the time of writing, only 1 and 5 are supported with the aimed goal of acheiving all 5 (and more).

## Usage

### DBC Data structure
When you create an fresh instance of the Dbc class using `new Dbc()`, a new data
structure is created to encapsulate all of the components that make up a dbc file.

After creating messages/signals or loading directly from a dbc file, you can see
the contents of the data by using the `.` operator on that specific class instance and calling the data variable,
e.g. `const dbc = new Dbc(); dbc.data;`

The structure of the data is as follows:
- Data
    - version: string | null -> Version of the DBC file
    - messages: Map<string, Message> -> A container of all available CAN messages
    - description: string | null; -> Short description of the DBC file
    - busConfiguration: number | null; -> Expected CAN bus speed
    - canNodes: string[]; -> List of nodes as they exist for the network topology
    - valueTables: Map<string, ValueTable> | null; -> Value Tables/Enumerations
    - attributes: Attributes | null; -> Any and all top level attributes

Invidiual messages can be pulled out by key (since the data structure is a Map) or by using the 
builtin uility function `getMessageById()` or `getMessageByName()`.
Each individual message contains a substructure with the following items:

- Message
    - name: string -> Name of the message
    - id: number -> CAN ID of the message
    - dlc: number -> Data Length Code (DLC) of the message
    - sendingNode: string | null -> Any node that sends this message
    - signals: Map<string, Signal> -> Map of all available signals attached to this message
    - description: string | null -> Short description of this message

Messages typically contain a list of signals. Signals can be access access in a similar way to that
of messages, since each message contains a Map data structure for its signals. CAN-DBC has built
in utility functions to make the process a little bit easier, namely `getSignalByName` and `getSignalsByName`.

The structure of an individual signal is:

- Signal
    - name: string
    - multiplex: string | null
    - startBit: number
    - length: number
    - endianness: string
    - signed: boolean
    - factor: number
    - offset: number
    - min: number
    - max: number
    - unit: string
    - receivingNodes: string[]
    - description: string | null
    - valueTable: ValueTable | null

### Loading a dbc
can-dbc loads dbc files asynchonously as to not bottleneck applications and as a result
the actual loading of the file will need to be wrapped in an async/await function or 
use `.then()` to catch the resulting data upon completion.

```js
const filePath = 'path\to\my\dbc\my_file.dbc'

dbc = Dbc();

dbc.load(filePath)
.then(data => {
    console.log(data);
})
```

### Creating and Adding Messages
You can create new messages and add them to the existing dataset. This works
whether you are creating a DBC from scratch or appending to existing DBC data.

```js

dbc = Dbc();

// Create message expects at minimum a name, ID, and DLC.
const msg1 = dbc.createMessage('MyMessageName', 100, 8);

// You can optionally define a message comment and define a node for the message
const msg2 = dbc.createMessage(
    'MyMessageName', // name
    103, // id
    8, // dlc
    'MyNode', // node
    'This is just a test comment' // comment
);

// To add the messages to the class data, you can simply call addMessage() with the Message object
dbc.addMessage(msg1);
dbc.addMessage(msg2);

```

### Creating signals
You can create new signals with calls to createSignal().

By default createSignal() assumes a few things if the optional parameters are not passed
to the function:

- Endianness -> Intel
- Multiplex -> None
- Signed -> False
- Factor -> 1
- Offset -> 0
- Min, Max -> 0
- Unit -> None
- Receiving Nodes -> None
- Description -> None
- Value Table -> None

At minimum name, start bit, and length need to be supplied

```js

dbc = Dbc();

// Create message expects at minimum a name, ID, and DLC.
const signal = dbc.createSignal(
    'MySignalName', // signal name
    3, // start bit
    8 // signal length
  )

const msg1 = dbc.createMessage('MyMessageName', 100, 8);
dbc.addMessage(msg1);

// To add the signal to the class data, you can simply call addSignal() with the Message name that the signal
// will be appended to in addition to the Signal object
dbc.addSignal('MyMessageName', signal);

```

## Contributing


## NPM Publishing
package.json includes four utility functions that will be run before publishing to NPM

#### Scripts
*prepare*
Will run both BEFORE the package is packed and published, and on local npm install.

*prepublishOnly*
Will run BEFORE prepare and ONLY on npm publish. Here we will run our test and lint to make sure we don’t publish bad code.

*preversion*
Will run before bumping a new package version. To be extra sure that we’re not bumping a version with bad code.

*version*
Will run after a new version has been bumped. A commit and a new version-tag will be made every time you bump a new version. This command will run BEFORE the commit is made. One idea is to run the formatter here and so no ugly code will pass into the new version

*postversion*
Will run after the commit has been made. A perfect place for pushing the commit as well as the tag.

#### Publishing

If you don’t have an account you can do so at https://www.npmjs.com/signup
npm login

npm publish

The package will first be built by the prepare script, then test and lint will run by the prepublishOnly script before the package is published

Bumping new patch version of the package
npm version patch
Our preversion, version, and postversion will run, create a new tag in git and push it to our remote repository. Now publish again:
npm publish
And now you have a new version