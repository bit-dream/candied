# **CANDIED**
![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/bit-dream/candied)
![npm bundle size](https://img.shields.io/bundlephobia/min/candied)
![GitHub issues](https://img.shields.io/github/issues-raw/bit-dream/candied)
![npm](https://img.shields.io/npm/dw/candied)
![license](https://img.shields.io/github/license/bit-dream/candied)
<br/>
![Heading Image](/assets/CAN_NETWORK.png)

## A general purpose CAN (Controller Area Network) toolbox with support for .dbc file parsing, CAN message decoding, and more
<br/>

### What are the goals of Candied
The goal of this library is simple - to create useful utilities
for _Controller Area Networks_ that will allow you to be successful in:
- Reading and editing common industry CAN file types, such as .dbc, .eds, .a2l, etc.
- Decode and encode CAN frames from database files (.dbc)
- Create general purpose interfaces that can be injected into other libraries (such as SocketCAN)
- Generate useful analytics tools for creating useful insights from CAN data
<br/>

Not all the stated goals of this project are currently implemented, and as
such, we are looking for active contributors. See our Contribution section
if you are interested expanding and developing for this project.

## Usage

### Installing the Library

Candied is freely available on NPM and can be installed directly using the command


`npm install candied`

You can also use a CDN if using the library in the browser:
```html
https://cdn.jsdelivr.net/npm/candied@2.1.0/dist-bundle/candied.js
```
```html
https://cdn.jsdelivr.net/npm/candied@2.1.0/dist-bundle/candied-fs.js
```

candied-fs houses utility functions, such as `dbcReader()`, that will
allow you to get the contents of the dbc file as a string that can then be
passed to the Dbc `.load()` function.



### Importing the Library
```js
    import {Dbc} from 'candied';
    // OR
    const Dbc = require('candied');
```
Note that if you are using Node, you may need to include:
`"type": "module"` in your parent package.json file so that the package can be imported correctly if using ```import```.

### Documentation
This README only gives a glimpse into how to use this library, for a more detailed
write up, make sure to check out our documentation: [readthedocs](https://can-dbc.readthedocs.io/en/latest/)

### Vector DBC Files
The DBC file is an ASCII based translation file used to apply identifying names, scaling, offsets, and defining information, to data transmitted within a CAN frame. 
<br/>
Simply put, it helps decode raw CAN (Controller Area Network) frames into something that is human readable.
<br/>

<br/>
CAN-DBC is one of the few (if not only) fully featured DBC parsing libraries that exist for Javascript/Typescript.
With CAN-DBC, you can translate the majority of a .dbc file's content into something that is human-readable and as such,
can handle the following:

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
12. Auto data type detection (uint8 vs float vs double vs int16, etc)

Creating DBC files are a breeze too. This library offers multiple ways of 
creating DBC files from scratch, including structured typing (method chaining).

```ts
import {Dbc} from 'candied';

const dbc = new Dbc();
dbc.version = '1.0';
dbc.description = 'DBC file for a cars tranmission message';

/* Create a new DBC file from scratch */
const transStaMsg = dbc.createMessage('TransmissionStatusMsg', 100, 8);

transStaMsg.add()
    .addAttribute('EngineSpeed','INT',{min: 10, max:100})
    .updateDescription('Indicates the status of a cars transmission')
    .updateNode('EngineECU') // Where the message is going, automatically generates the node
    .addSignal('OperatingStatus', 0, 10)
    .addSignal('RotationSpeed', 10, 32, {isFloat: true, signed: true, unit: 'RPM'})
    .addSignal('LimpMode', 45, 2, {endian: 'Motorola', max: 3});

dbc.write();

```

For an alternative approach we can:
```ts
import {Dbc} from 'candied';

const dbc = new Dbc();
dbc.version = '1.0';
dbc.description = 'DBC file for a cars tranmission message';

/* Create a new DBC file from scratch */
const transStaMsg = dbc.createMessage('TransmissionStatusMsg', 100, 8);
dbc.addMessage(transStMsg);

const sig1 = dbc.createSignal('OperatingStatus', 0, 10);
const sig2 = dbc.createSignal('RotationSpeed', 10, 32, {isFloat: true, signed: true, unit: 'RPM'});
const sig3 = dbc.createSignal('LimpMode', 45, 2, {endian: 'Motorola', max: 3});
dbc.addSignal([sig1,sig2,sig3])

dbc.write();
```

#### Loading DBC files

This library offers two ways main ways of loading a DBC file into human-readable content
- Web/Browser based loading
- Node based loading

Candied comes with a sub-folder called `filesystem` that includes
utility functions that can help with unloading the content of a DBC file.
The returned content can then be passed to the main `.load()` function
of the Dbc class instance.

Note: Only import ONE type of utility from the library for your
target platform. If you try to import the Node based file, and you
are using tools like webpack, you may encounter build errors because
of select Node dependencies! The below example shows importing both
for conciseness.

```ts
import {Dbc} from 'candied';

const dbc = new Dbc();

// Node based file loading
import dbcReader from "dbc-can/lib/filesystem/DbcReader"
const fileContent = dbcReader('example.dbc');
const data = dbc.load(fileContent);

// Browser based file loading
import {dbcReader} from "dbc-can/lib/filesystem/DbcWebFs";
// dbcReader expects a file based/blob based input
// interface File extends Blob
const fileContent = dbcReader(file);
const data = dbc.load(fileContent);


```

#### Decoding CAN Messages
Candied has the ability to decode CAN frames to its real world values.

```ts
import {Dbc, Can} from 'candied';
import dbcReader from "dbc-can/lib/filesystem/DbcReader"

const dbc = new Dbc();
const fileContent = dbcReader('tesla_can.dbc');
const data = dbc.load(fileContent)

// Can() class allows for creation of CAN frames as well as message decoding
const can = new Can();
can.database = data;
const canFrame = can.createFrame(264, [40, 200, 100, 140, 23, 255, 66, 12]);
// decode takes in type Frame. Returns a bound message type
/*
    name: string;
    id: number;
    signals: Map<string, BoundSignal>;
*/
let boundMsg = can.decode(canFrame);
/* Bound signals contain: 
    **Physical value** - Conditioned value that has any units applied, as well as any scaling, factors, and min/max values
    if any enumerations are attached the signal, the enumeration member will automatically be returned
    **Value** - Conditioned value that has scaling, factor, and min/max values applied
    **Raw Value** - Raw value as extracted according to the DBC file
*/
let boundSignals = boundMsg?.signals;
console.log(boundSignals);

/* RETURNS */
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
Candied allows you to export loaded or created DBC data directly from the class instance

```ts
import {Dbc} from 'candied';

const dbc = new Dbc();
const fileContent = dbcReader('tesla_can.dbc');
const data = dbc.load(fileContent)
dbc.toJson({pretty: true}); // Pretty will print the returned json on multiple lines

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
        }
...
```
<br/>

# Contributing

Contributing is highly encouraged! Help is wanted to expand upon this
libraries feature set, fix bugs, general refactoring, etc.


Contributing is easy. If you see something that:

1. Needs improving
2. Has bugs
3. Needs new features

Open a new GitHub issue on this project. We can either get you set up
on a new branch within this repository, or alternatively you can create a fork
and do a pull request.

All pull requests are ran through Circle CI before we allow you to merge, and as
such, you will need to:
1. Pass all linting rules
2. Pass all unit tests
3. Ensure all typescript files are buildable

You should also write tests for all added features/bugs, etc. We use Jest, but
if you think something else will fit the bill. Use it.

**What you'll be using out of the box:**
1. Jest for tesing
2. TSLint for all linting
3. Prettier for file formatting and clean code
4. Typescript

Suggestions for new tooling are more than welcome.
<br/>


This project uses TSPeg for its parser generator. As such, a PEG style grammar file is defined
in the parser_generator folder of this project. If you are making edits to the parsing 
grammar, `npm run build`  will both build the parser and typescript files for you.
The parser output gets automatically migrated to the src/parser folder.
`npm run build` will also create a web based bundle using rollup.


