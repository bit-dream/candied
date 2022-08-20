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