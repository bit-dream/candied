# **DBC-CAN**
<br/>

## *A zero dependency, lightly weight parser, written in pure Javascript/Typescript*
<br/>
<br/>

## **Motivation**
<br/>

### <i><b>What is a DBC file?</b><i>
<br/>
The DBC file is an ASCII based translation file used to apply identifying names, scaling, offsets, and defining information, to data transmitted within a CAN frame. 
<br/>
Simply put, it helps decode raw CAN (Controller Area Network) frames into something that is human readable.
<br/>
<br/>

### <i><b>What are the goals of DBC-CAN</b></i>
<br/>
To develop and deploy a very simple, lightweight library that doesn't rely on external dependencies.
<br/>

You should be able to do the following with this library:
1. Load and parse a .dbc file so that its contents can be analysed (messages, signals, etc.)
2. Create your own .dbc file by creating messages, signals, value tables, enumerations.
3. Decode individual CAN frames into human readable content.
4. Encode to a raw CAN frame from a DBC message
5. Use utility functions to help analyize DBC files.
<br/>
<br/>

### <i><b>Why you should use this library</b></i>
<br/>
CAN-DBC is really the only full feldge DBC parsing library that exists in the javascript-sphere. There are other parsers that exist
out in the wild, however they are very limited in capabilities. Most can only pull simple message and signal definitions.
<br/>
<br/>

With CAN-DBC, you can translate the majority of a .dbc file's content into something that is human readable
<br/>

CAN-DBC handles:
1. Message definitions
2. Signal definitions
3. Environment variables
4. Network bridges
5. CAN Network Nodes/ECUs
6. Value table definitions
7. Signal groupings
8. Comments/descriptions for all signals, nodes, environment variables, messages, and others.
9. All defined attributes (global, signals, nodes, EVs, messages, etc)
10. File version number
11. All defined 'New Symbols'


## Usage

### Installing the Library

dbc-can is freely available on NPM and can be installed directly using the command 


`npm install dbc-can`


### Importing the Library
```js
    import Dbc from 'dbc-can';
    // OR
    const Dbc = require('dbc-can');
```
Note that if you are using Node, you may need to include:
`"type": "module"` in your parent package.json file so that the package can be imported correctly if using ```import```.

### DBC Data structure
When you create an fresh instance of the Dbc class using `new Dbc()`, a new data
structure is created to encapsulate all of the components that make up a dbc file.

After creating messages/signals or loading directly from a dbc file, you can see
the contents of the data by using the `.` operator on that specific class instance and calling the data variable,
e.g. `const dbc = new Dbc(); dbc.data;`

<br/>

The structure of the data is as follows:
| Name          | Type          | Description  |
| ------------- |:-------------:| -----:|
| Version      | String        | Version number of the file |
| Messages     | Map Container |  Messages parsed from the dbc |
| Description  | String        | A short description of the file |
| Bus Speed    | String        | Typically undefeined, this has been depreciated by Vector |
| Nodes        | Map Container | Network Nodes/ECUs |
| Environment Variables  | Map Container      | All defined 'environmental variables' and definitions |
| Attributes   | Map Container      | All attributes for messages, signals, etc |
| Can Bridges  | Map Container      | Messages that bridge CAN networks |

<br/>

Invidiual messages can be pulled out by key (since the data structure is a Map) or by using the 
builtin uility function `getMessageById()` or `getMessageByName()`.
Each individual message contains a substructure with the following items:

| Name          | Type          | Description  |
| ------------- |:-------------:| -----:|
| Message Name      | String        | Name of the message |
| ID     | Number |  CAN Id of the message |
| DLC  | Number        | Data length code |
| Sending Node  | String        | Node that sends this message |
| Signals        | Map Container | Signals that make up this message |
| Signal Groupings  | Map Container      | How the signals are grouped in the message |
| Description   | String    | A short description of what the message is |
| Attributes  | Map Container      | All other misc. attributes for this message |

<br/>

Messages typically contain a list of signals. Signals can be access access in a similar way to that
of messages, since each message contains a Map data structure for its signals. DBC-CAN has built
in utility functions to make the process a little bit easier, namely `getSignalByName` and `getSignalsByName`.

The structure of an individual signal is:

| Name          | Type          |
| ------------- |:-------------:|
| Name     | String        |
| Multiplexor     | String |
| Start Bit  | Number        |
| Length  | Number        |
| Endian        | String |
| Signed  | Boolean     |
| Factor   | Number    |
| Offset  | Number |
| Min  | Number |
| Max  | Number |
| Unit  | String |
| Receiving Nodes  | List |
| Description  | String |
| Value Table  | Map Container |


<br/>


### Loading a dbc

#### Aysnc/Non-block Loading
You can load files asynchonously as to not bottleneck applications.
The actual loading of the file will need to be wrapped in an async/await function or 
use `.then()` to catch the resulting data upon completion.

```js
const filePath = 'path\to\my\dbc\my_file.dbc'

const dbc = new Dbc();

dbc.load(filePath)
.then(data => {
    console.log(data);
})
```

#### Synchronous Loading
Alteratively to the ```.load()``` method, you can load data from a DBC file in a blocking/synchronous way
by calling the ```.loadSync()``` method.

```js
const filePath = 'path\to\my\dbc\my_file.dbc'

const dbc = new Dbc();
const data = dbc.loadSync(filePath);
console.log(data);

```

### Modifing Top Level Properties

As outlined in the Dbc Data Structure section, there a few top level properties that can be modified
to suit your individual needs. dbc-can has built in setters for the class that allow you to directly modify them.

```js
import Dbc from 'dbc-can';

const dbc = new Dbc();
dbc.version = '1.0'; // Internal DBC file version number
dbc.busConfiguration = 500 // CAN bus speed
dbc.canNodes = ['Node1', 'Node2'] // Top level nodes that exist on the CAN bus

```

### Creating and Adding Messages
You can create new messages and add them to the existing dataset. This works
whether you are creating a DBC from scratch or appending to existing DBC data.

```js

const dbc = new Dbc();

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

// Alternatively, you can pass addMessage() an array of messages for easier adding
dbc.addMessage([msg1,msg2]);

/* Note that when creating a message that what is being returned is a simple object.
 * If you don't want to pass the additional arguments to createMessage() you can
 * access the properties directly
*/
msg1.sendingNode = 'MyNode';
msg1.description = 'This is a description for this message';
dbc.addMessage(msg1);

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

const dbc = new Dbc();

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

// Just like addMessage(), addSignal() can optionally take an array of signals
const signal2 = dbc.createSignal(
    'MySignalName2', // signal name
    16, // start bit
    8 // signal length
);

dbc.addSignal('MyMessageName', [signal,signal2]);

/* Note that when creating a signal that what is being returned is a simple object.
 * If you don't want to pass the additional arguments to createSignal() you can
 * access the properties directly. This may be preferential so you don't have to pass
 * all of the additional arguments if you are only intending to modify a few of them.
*/
signal.signed = true
signal.endianness = 'Motorola'
dbc.addSignal('MyMessageName',signal);

```
### Writing DBC Files
Writing to a DBC file is relatively easy using the builtin write function.

```js
import Dbc from 'dbc-can';

const dbc = new Dbc();

const msg = dbc.createMessage('TestMessage', 10, 8);
const signal = dbc.createSignal('TestSignal', 0, 4);

dbc.addMessage(msg);
dbc.addSignal('TestMessage', signal);

// Put in the path to the file, making sure to include the .dbc extension
// The data that is written to the file is the data that is encapsulated within the class instance
dbc.write('path/to/file.dbc');

```

### Example DBC File Creation
Below is an example of how you can create a fairly large DBC file with relative ease. For this particular
example, we will create a DBC file that contains over 700 individual CAN messages and a few signals contained
in each message.
```js
const dbc = new Dbc();

// Create a blank array with over 700 elements
// We'll use this to create our number range 0-699
let range = new Array(700);
for (const key of range.keys()) {

    // Give each message a unique name by appending the iteration number
    const msgName = 'Message' + (key + 1).toString();

    // Create and add the message to the class data
    let msg = dbc.createMessage(msgName, key + 1, 8);
    dbc.addMessage(msg);

    // Create and add the signals to the newly created message
    let signal1 = dbc.createSignal('Signal1', 0, 16);
    let signal2 = dbc.createSignal('Signal2', 28, 16);
    dbc.addSignal(msgName,[signal1,signal2]);
}

// Write the data to a file
dbc.write('/Users/Documents/Large.dbc')
```

### Decoding CAN Messages
DBC-CAN has the ability to decode CAN frames to its real world values.

```js
import Dbc from 'dbc-can';
import { CAN } from 'dbc-can';

const dbc = new Dbc();

// createFrame will automatically determine DLC from the payload size as well as extended vs standard for the ID
// Payload assumes decimal. Payload values are clamped if values entered are above 255 or below 0.
// i.e. 300 = 255, -1 = 0
dbc.load('tesla_can.dbc').then(data=>{

    // Can() class allows for creation of CAN frames as well as message decoding
    const can = new Can(data);
    const canFrame = can.createFrame(264, [40, 200, 100, 140, 23, 255, 66, 12]);
    // decode takes in type Frame. Returns a bound message type
    /*
        name: string;
        id: number;
        signals: Map<string, BoundSignal>;
    */
    let boundMsg = can.decode(canFrame);
    /* Bound signals contain: 
        Physical value - Conditioned value that has any units applied, as well as any scaling, factors, and min/max values
        if any enumerations are attached the signal, the enumeration member will automatically be returned
        Value - Conditioned value that has scaling, factor, and min/max values applied
        Raw Value - Raw value as extracted according to the DBC file
    */
    let boundSignals = boundMsg?.signals;
    console.log(boundSignals);
});

```

Returns
```js
Map(7) {
  'DI_torqueDriver' => { value: 522, rawValue: 2088, physValue: '522 Nm' },
  'DI_torque1Counter' => { value: 6, rawValue: 6, physValue: '6' },
  'DI_torqueMotor' => { value: 750, rawValue: 3172, physValue: '750 Nm' },
  'DI_soptState' => { value: 4, rawValue: 4, physValue: 'SOPT_TEST_NOT_RUN' },
  'DI_motorRPM' => { value: -233, rawValue: -233, physValue: '-233 RPM' },
  'DI_pedalPos' => {
    value: 26.400000000000002,
    rawValue: 66,
    physValue: '26.400000000000002 %'
  },
  'DI_torque1Checksum' => { value: 12, rawValue: 12, physValue: '12' }
}
```

### Exporting to JSON
DBC-CAN allows you to export loaded or created DBC data directly from the class instance

```js
import Dbc from 'dbc-can';

const dbc = new Dbc();
dbc.load('DBC_template.dbc').then(data=>{
    // You can optionally past a value of false to toJson so no formatting is applied to the output
    // ie. .toJson(false)
    let json = dbc.toJson();
    console.log(json);
})

```

Returns
```json
{
  "version": "1.0",
  "messages": [
    {
      "name": "CANMessage",
      "id": 1234,
      "dlc": 8,
      "sendingNode": "Node0",
      "signals": [
        {
          "name": "Signal0",
          "multiplex": "",
          "startBit": 0,
          "length": 32,
          "endianness": "Intel",
          "signed": true,
          "factor": 1,
          "offset": 0,
          "min": 0,
          "max": 0,
          "unit": "",
          "receivingNodes": [
            "Node1",
            "Node2"
          ],
          "description": "First signal in this message",
          "valueTable": null
        },
        {
          "name": "Signal1",
          "multiplex": "",
          "startBit": 32,
          "length": 32,
          "endianness": "Intel",
          "signed": false,
          "factor": 100,
          "offset": 0,
          "min": 0,
          "max": 100,
          "unit": "%",
          "receivingNodes": [
            "Node1",
            "Node2"
          ],
          "description": null,
          "valueTable": null
        }
      ],
      "description": null
    },
    {
      "name": "CANMultiplexed",
      "id": 4321,
      "dlc": 2,
      "sendingNode": "Node0",
      "signals": [
        {
          "name": "Multiplexer",
          "multiplex": "M",
          "startBit": 0,
          "length": 8,
          "endianness": "Intel",
          "signed": false,
          "factor": 1,
          "offset": 0,
          "min": 0,
          "max": 0,
          "unit": "",
          "receivingNodes": [
            "Node1"
          ],
          "description": null,
          "valueTable": null
        },
        {
          "name": "Value0",
          "multiplex": "m0",
          "startBit": 8,
          "length": 8,
          "endianness": "Intel",
          "signed": false,
          "factor": 1,
          "offset": 0,
          "min": 0,
          "max": 0,
          "unit": "",
          "receivingNodes": [
            "Node1"
          ],
          "description": null,
          "valueTable": {
            "0": "Value0",
            "1": "Value1",
            "2": "Value2"
          }
        },
        {
          "name": "Value1",
          "multiplex": "m1",
          "startBit": 8,
          "length": 8,
          "endianness": "Intel",
          "signed": false,
          "factor": 1,
          "offset": 0,
          "min": 0,
          "max": 0,
          "unit": "",
          "receivingNodes": [
            "Node1"
          ],
          "description": null,
          "valueTable": {}
        }
      ],
      "description": "Multiplexed CAN-Message"
    }
  ],
  "description": "DBC Template with multiline description",
  "busConfiguration": 500,
  "canNodes": [
    "Node0",
    "Node1",
    "Node2"
  ],
  "valueTables": {
    "Numbers": [
      "Three",
      "Two",
      "One",
      "Zero"
    ]
  },
  "attributes": null
}
```
<br/>

# Contributing
<br/>

Contributing is highly encouraged.

<br/>
If you want to become a contributer you can either create a new issue for this project or comment on an existing issue indicating that you would like to do the pull request for that feature. You can also join the discussion board or message be directly.
<br/>


The project should be already be setup to make you a successful contributor.
<br/>

**What you'll be using out of the box:**
1. Jest for tesing
2. TSLint for all linting
3. Prettier for file formatting and clean code
4. Typescript

Suggestions for new tooling are more than welcome.
<br/>

**The package.json has many utility scripts that can be run via npm run**

| Name          | Type          |
| ------------- |:-------------:|
| test          | Run all unit test suites       |
| coverage          | Code coverage report      |
| build          | Build the typescript files    |
| format          | Code Formatting      |
| lint          | Linting      |
| go          | Quick utility function that will build and run index.ts      |
| buildparser          | Builds the DBC parser class      |
| test:debug          | Debug jest test files      |

This project uses TSPeg for it's parser generator. As such, a PEG style grammar file is defined
in the parser_generator folder of this project. There really isn't a need to run the npm buildparser command if you need
to make grammar updates/parser updates to this project, `npm run build`  will both build the parser and typescript files for you.
The parser output gets automatically migrated to the src/parser folder.

<br/>

In addition to all of the above utility scripts, this project contains all of the necessary functions to eventually publish to NPM via the `npm run publish` command.

<br/>

We ask that the linter and format commands are ran before you issue a pull request.

