# bash-emulator

[![Build Status](https://travis-ci.org/trybash/bash-emulator.svg?branch=gh-pages)](https://travis-ci.org/trybash/bash-emulator) [![on npm](https://img.shields.io/npm/v/bash-emulator.svg)](https://www.npmjs.com/package/bash-emulator)

This module can help you if you like to emulate a bash shell in plain Javascript.

This might be useful for education purposes or even to ease the interaction with a back-end system.

`bash-emulator` implements an environment for bash commands to run in and it also includes some default commands.

The system doesn't handle any UI interaction but provides hooks to communicate with other systems.
It's easy to add new commands and customize the underlying file system.



## Usage

The module can be used in Node.js or in the browser.
Get it with:

``` js
npm install --save bash-emulator
```

[Example usage](/index.html)

The module exports one function that can be required from another module.
Please use a tool like [webpack](https://webpack.github.io/) or [browserify](http://browserify.org/)
for bundling and minification in your own workflow.

`bashEmulator(state) -> emulator`
  - `state` an optional object to initialize the state. For shape [see below](#the-state-object).
  - Returns an `emulator` object

### `emulator`

- `run(command) -> Promise(output, code)`
  - `command` a bash command as string
  - Returns a `Promise` that resolves with an output string.
- `getDir() -> Promise(path)`
  - Returns a Promise that resolves with the current working directory
- `changeDir(path) -> Promise`
  - `path` relative path to set working directory to
  - Returns a Promise that resolves when change is done
- `read(filePath) -> Promise(content)`
  - `filePath` relative path of file to read
  - Returns a Promise that resolves with the content of the file
- `readDir(path) -> Promise([files])`
  - `path` optional, relative path of directory to read. Defaults to current directory.
  - Returns a Promise that resolves with an array of file names.
- `getStats(path) -> Promise(stats)`
  - `path` optional path of file or directory. Defaults to current directory.
  - Returns a Promise that resolves with a stats object. For now, only property is `modified`.
- `createDir(path) -> Promise`
  - `path` relative, non-existed path for new directory
  - Returns a Promise that resolves when directory is created
- `write(filePath, content) -> Promise`
  - If file isn't empty, content is appended to it.
  - `filePath` path of file that should be written to. File doesn't have to exist.
  - Returns a Promise that resolves when writing is done
- `remove(path) -> Promise`
  - `path` path of file or directory to be deleting
  - Returns a Promise that resolves when deleting is done
- `getHistory() -> Promise([commands])`
  - Returns a Promise that resolves with a array containing all commands from the past
- `clearScreen() -> Promise`
  - Returns a Promise that resolves when clearing is done
- `getDimensions() -> Promise(dimensions)`
  - Returns a Promise with an dimensions object `{ x, y }`
- `completeUp(input) -> Promise(command)`
  - Complete a command from history
  - Can be called multiple times to go further back in history
  - See [example](/index.html) for connecting arrow-keys with completion
  - `str` command that should be completed
  - Returns a Promise with a command, is `undefined` if no completion found
- `completeDown(input) -> Promise(command)`
  - Move in opposite direction to `completeUp`
  - `str` command that should be completed
  - Returns a Promise with a command, is `undefined` if no completion found
- `commands`
  - An object with all commands that the emulator knows of
- `state`
  - [See below](#the-state-object)

### The `state` object

__It's not recommended to access the state directly. Use the above defined helper methods instead.__

- `history` an array of strings containing previous commands
- `user` name of the current user (defaults to `"user"`)
- `workingDirectory` a string containing the current working directory (defaults to `/home/user`)
- `fileSystem` an object that maps from absolute paths to directories or files.
  - Each value has a `type` property thats either `'dir'` or `'file'`
    and a `modified` property containing a unix timestamp
  - Files also have a `content` property.
  - Default file system contains only directories for `/home/user`


### Storing state in `localStorage`

``` js
var state = JSON.parse(localStorage.bashEmulator || '{}')
var emulator = bashEmulator(state)
function saveState () {
  localStorage.bashEmulator = JSON.stringify(emulator.state)
}
emulator.run().then(saveState)
```


### Writing your own commands

You can modify the `commands` object of your emulator instance
to your liking.

To add a new command you need to implement the following API:

``` js
var emulator = bashEmulator()
emulator.commands.myCommand = function (env, args) {}
```

- `env` object with:
  - `output(string)` call to write a string to stdout
  - `error(string)` call to write a string to stderr
  - `exit(code)` call to exit command.
    - `code` integer to mark state of exit. Failure when not `0` (optional)
  - `system` reference to the emulator object.
- `args` array from command string. First element is command name.
- Optionally return object to register handlers for events:
  `{ input: fn, close: fn }`


### Using a custom file system

You can ignore the simple, built-in file system and overwrite all
required methods of your emulator instance with custom implementations.
The API of the methods are designed to work with asynchronous implementations as well.


## Development

- Setup project using `npm install`
- Make sure tests are running using `npm test`
- Build the `bash-emulator.min.js` file with `npm run build`


## Roadmap

- readline completion
- patterns for path expansion
- pipes
- basic logic
- simlinks
- readline shortcuts


### Built-in commands and flags

- [x] `ls`
    - [ ] `-l`
    - [x] `-a`
- [x] `cd`
- [x] `pwd`
- [x] `history`
- [x] `cat`
    - [x] `-n`
- [x] `clear`
- [ ] `touch`
- [ ] `mkdir`
    - [ ] `-p`
- [ ] `mv`
  - [ ] `-n`
- [ ] `cp`
    - [ ] `-r`
    - [ ] `-R`
- [ ] `rm`
    - [ ] `-r`
    - [ ] `-R`
- [ ] `rmdir`

#### Future

- [ ] `echo`
- [ ] `head`
- [ ] `tail`
- [ ] `wc`
- [ ] `sort`
- [ ] `uniq`
- [ ] `nl`
- [ ] `tac`
- [ ] `ln`
- [ ] `less`
- [ ] `man`


## Browser Support

To support IE, please use a promise polyfill.
For example:
https://github.com/stefanpenner/es6-promise


## LICENSE

[MIT](/LICENSE)

