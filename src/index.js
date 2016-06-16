var pick = require('ramda/src/pick')
var merge = require('ramda/src/merge')
var commands = require('./commands')

function bashEmulator (initialState) {
  var state = createState(initialState)
  var emulator = {
    commands: commands,
    state: state,
    run: function (input) {
      var args = input.split(' ')
      var cmd = args.shift()
      if (!commands[cmd]) {
        return Promise.reject('not implemented yet')
      }
      return new Promise(function (resolve) {
        commands[cmd]({
          output: resolve,
          exit: resolve,
          system: emulator
        }, args)
      })
    },
    getDir: function () {
      return Promise.resolve(state.workingDirectory)
    },
    changeDir: function (path) {
      state.workingDirectory = path
      return Promise.resolve()
    },
    read: function (filePath) {
      return Promise.resolve(state.fileSystem[filePath].content)
    },
    readDir: function (path) {
      // TODO:
      // - `readDir(path) -> Promise([files])`
      //   - `path` optional, relative path of directory to read. Defaults to current directory.
      //   - Returns a Promise that resolves with an array listing all content of the directory
    },
    getStats: function (path) {
      return Promise.resolve(state.fileSystem[path].meta)
    },
    createDir: function (path) {
      // TODO:
      // - `createDir(path) -> Promise`
      //   - `path` relative, non-existed path for new directory
      //   - Returns a Promise that resolves when directory is created
    },
    write: function (filePath, content) {
      // TODO:
      // - `write(filePath) -> Promise`
      //   - If file isn't empty, content is appended to it.
      //   - `filePath` path of file that should be written to. File doesn't have to exist.
      //   - Returns a Promise that resolves when writing is done
    },
    remove: function (path) {
      delete state.fileSystem[path]
      return Promise.resolve()
    },
    getHistory: function () {
      return Promise.resolve(state.history)
    }
  }
  return emulator
}

function createState (initialState) {
  var state = defaultState()
  return merge(state, pick(Object.keys(state), initialState || {}))
}

function defaultState () {
  return {
    history: [],
    fileSystem: {
      '/': {
        type: 'dir',
        lastEdited: Date.now()
      },
      '/home': {
        type: 'dir',
        lastEdited: Date.now()
      },
      '/home/username': {
        type: 'dir',
        lastEdited: Date.now()
      }
    },
    workingDirectory: '/home/username'
  }
}

module.exports = bashEmulator
