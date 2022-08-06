# CAN-DBC
### A zero dependency, lightly weight parser, written in pure Javascript/Typescript


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