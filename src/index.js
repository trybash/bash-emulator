var pick = require('ramda/src/pick')
var merge = require('ramda/src/merge')
var commands = require('./commands')

function bashEmulator (initialState) {
  var state = createState(initialState)
  function getPath (path) {
    return joinPaths(state.workingDirectory, path)
  }

  var emulator = {
    commands: commands,

    state: state,

    run: function (input) {
      var args = input.split(' ')
      var cmd = args.shift()
      state.history.push(input)
      if (!commands[cmd]) {
        return Promise.reject(cmd + ': command not found')
      }
      var result = ''
      return new Promise(function (resolve, reject) {
        commands[cmd]({
          output: function (str) {
            result += str
          },
          // NOTE: For now we just redirect stderr to stdout
          error: function (str) {
            result += str
          },
          // NOTE: For now we don't use specific error codes
          exit: function (code) {
            if (code) {
              reject(result)
            } else {
              resolve(result)
            }
          },
          system: emulator
        }, args)
      })
    },

    getDir: function () {
      return Promise.resolve(state.workingDirectory)
    },

    changeDir: function (target) {
      var normalizedPath = getPath(target)
      if (!state.fileSystem[normalizedPath]) {
        return Promise.reject(normalizedPath + ': No such file or directory')
      }
      state.workingDirectory = normalizedPath
      return Promise.resolve()
    },

    read: function (arg) {
      var filePath = getPath(arg)
      if (!state.fileSystem[filePath]) {
        return Promise.reject(arg + ': No such file or directory')
      }
      if (state.fileSystem[filePath].type !== 'file') {
        return Promise.reject(arg + ': Is a directory')
      }
      return Promise.resolve(state.fileSystem[filePath].content)
    },

    readDir: function (path) {
      var dir = getPath(path)
      if (!state.fileSystem[dir]) {
        return Promise.reject('cannot access ' + path + ': No such file or directory')
      }
      var listing = Object.keys(state.fileSystem)
        .filter(function (path) {
          return path.startsWith(dir) && path !== dir
        })
        .map(function (path) {
          return path.substr(dir === '/' ? dir.length : dir.length + 1)
        })
        .filter(function (path) {
          return !path.includes('/')
        })
        .sort()
      return Promise.resolve(listing)
    },

    // getStats: function (path) {
    //   return Promise.resolve(state.fileSystem[path].meta)
    // },

    // createDir: function (path) {
      // TODO:
      // - `createDir(path) -> Promise`
      //   - `path` relative, non-existed path for new directory
      //   - Returns a Promise that resolves when directory is created
    // },

    // write: function (filePath, content) {
      // TODO:
      // - `write(filePath) -> Promise`
      //   - If file isn't empty, content is appended to it.
      //   - `filePath` path of file that should be written to. File doesn't have to exist.
      //   - Returns a Promise that resolves when writing is done
    // },

    remove: function (path) {
      if (!state.fileSystem[path]) {
        return Promise.reject('cannot remove ‘' + path + '’: No such file or directory')
      }
      Object.keys(state.fileSystem).forEach(function (key) {
        if (key.startsWith(path)) {
          delete state.fileSystem[key]
        }
      })
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
      '/home/user': {
        type: 'dir',
        lastEdited: Date.now()
      }
    },
    user: 'user',
    workingDirectory: '/home/user'
  }
}

function joinPaths (a, b) {
  var path = (b.charAt(0) === '/' ? '' : a + '/') + b
  var parts = path.split('/').filter(function noEmpty (p) {
    return !!p
  })
  // Thanks to nodejs' path.join algorithm
  var up = 0
  for (var i = parts.length - 1; i >= 0; i--) {
    var part = parts[i]
    if (part === '.') {
      parts.splice(i, 1)
    } else if (part === '..') {
      parts.splice(i, 1)
      up++
    } else if (up) {
      parts.splice(i, 1)
      up--
    }
  }
  return '/' + parts.join('/')
}

module.exports = bashEmulator
