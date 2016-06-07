# bash-emulator

[on npm](https://www.npmjs.com/package/bash-emulator)


## Usage

[Example usage](/index.html)

The module exports one function that can be required from another module.
Please use a tool like [webpack](https://webpack.github.io/) or [browserify](http://browserify.org/)
for bundling and minification in your own workflow.

`bashEmulator()`
  - Returns an `emulator` object

### `emulator`

- `run(command)`
  - `command` a bash command as string
  - Returns a `Promise` that resolves with an output string
- `getDir()`
  - Returns a Promise that resolves with the current working directory
- `changeDir(path)`
  - `path` relative path to set working directory to
  - Returns a Promise that resolves when change is done
- `read(filePath)`
  - `filePath` relative path of file to read
  - Returns a Promise that resolves with the content of the file
- `readDir(path)`
  - `path` optional, relative path of directory to read. Defaults to current directory.
  - Returns a Promise that resolves with an array listing all content of the directory
- `getStats(path)`
  - `path` optional path of file or directory. Defaults to current directory.
  - Returns a Promise that resolves with a stats object. For now, only property is `lastEdited`.
- `createDir(path)`
  - `path` relative, non-existed path for new directory
  - Returns a Promise that resolves when directory is created
- `write(filePath)`
  - If file isn't empty, content is appended to it.
  - `filePath` path of file that should be written to. File doesn't have to exist.
  - Returns a Promise that resolves when writing is done
- `remove(path)`
  - `path` path of file or directory to be deleting
  - Returns a Promise that resolves when deleting is done
- `getHistory()`
  - Returns a Promise that resolves with a array containing all commands from the past
- `clearScreen()`
  - Returns a Promise that resolves when clearing is done
- `getDimensions()`
  - Returns a Promise with an dimensions object `{ x, y }`
- `commands`
  - An object with all commands that the emulator knows of
- `state`
  - `history`
  - `fileSystem`
  - `workingDirectory`


### Storing state in `localStorage`

``` js
var state = JSON.parse(localStorage.bashEmulator || 'null')
var emulator = bashEmulator()
if (state) {
  emulator.state = state
}
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


## Roadmap

- file system
- history
- path
- patterns for path expansion
- pipes
- basic logic
- readline shortcuts
- readline completion
- killring

### `builtin` - Built-in Commands

- `ls; ls dir; ls -a; ls -l`
- `cd; cd dir; cd ~/dir; cd ..`
- `pwd`
- `history`
- `cat .secret.txt; cat f1 f2; cat dir/*`
- `clear`
- `head`
- `tail`
- `mkdir`
- `mv`
- `cp`
- `rm`
- `touch`
- `echo bla > file`
- `;`
- `>`
- `>>>`
- `<`
- `&&`
- `||`
- `wc; wc -l; wc -c`
- `sort`
- `uniq`
- `nl`
- `tac`
- `less`


## Browser Support

To support IE, please use a promise polyfill.
For example:
https://github.com/stefanpenner/es6-promise


## LICENSE

[MIT](/LICENSE)

