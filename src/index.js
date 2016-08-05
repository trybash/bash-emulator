require('array.prototype.findindex')
require('string.prototype.startswith')
require('string.prototype.includes')
require('string.prototype.repeat')
var commands = require('./commands')

function bashEmulator (initialState) {
  var state = createState(initialState)
  var completion = {}

  function getPath (path) {
    return joinPaths(state.workingDirectory, path)
  }

  function parentExists (path) {
    var parentPath = getPath(path).split('/').slice(0, -1).join('/')

    return emulator.stat(parentPath).then(function (stats) {
      if (stats.type === 'dir') {
        return Promise.resolve()
      }

      return Promise.reject(parentPath + ': Is not a directory')
    })
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
        return Promise.reject('cannot access ‘' + path + '’: No such file or directory')
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

    stat: function (path) {
      var filePath = getPath(path)
      if (!state.fileSystem[filePath]) {
        return Promise.reject(path + ': No such file or directory')
      }

      var pathParts = filePath.split('/')
      return Promise.resolve({
        modified: state.fileSystem[filePath].modified,
        type: state.fileSystem[filePath].type,
        name: pathParts[pathParts.length - 1]
      })
    },

    createDir: function (path) {
      return emulator.stat(path)
        .then(function () {
          return Promise.reject('cannot create directory \'' + path + '\': File exists')
        }, function () {
          return parentExists(path)
        })
        .then(function () {
          var dirPath = getPath(path)
          state.fileSystem[dirPath] = {
            type: 'dir',
            modified: Date.now()
          }
        })
    },

    write: function (path, content) {
      if (typeof content !== 'string') {
        try {
          content = JSON.stringify(content)
        } catch (e) {
          return Promise.reject(e)
        }
      }

      return parentExists(path).then(function () {
        var filePath = getPath(path)
        return emulator.stat(path).then(function (stats) {
          if (stats.type !== 'file') {
            return Promise.reject(filePath + ': Is a folder')
          }
          var oldContent = state.fileSystem[filePath].content
          state.fileSystem[filePath].content = oldContent + content
          state.fileSystem[filePath].modified = Date.now()
        }, function () {
          // file doesnt exist: write
          state.fileSystem[filePath] = {
            type: 'file',
            modified: Date.now(),
            content: content
          }
        })
      })
    },

    remove: function (path) {
      var filePath = getPath(path)
      if (!state.fileSystem[filePath]) {
        return Promise.reject('cannot remove ‘' + path + '’: No such file or directory')
      }
      Object.keys(state.fileSystem).forEach(function (key) {
        if (key.startsWith(filePath)) {
          delete state.fileSystem[key]
        }
      })
      return Promise.resolve()
    },

    copy: function (source, destination) {
      var sourcePath = getPath(source)
      var destinationPath = getPath(destination)
      if (!state.fileSystem[sourcePath]) {
        return Promise.reject(source + ': No such file or directory')
      }
      function renameAllSub (key) {
        if (key.startsWith(sourcePath)) {
          var destKey = key.replace(sourcePath, destinationPath)
          state.fileSystem[destKey] = state.fileSystem[key]
        }
      }
      return parentExists(destinationPath).then(function () {
        Object.keys(state.fileSystem).forEach(renameAllSub)
      })
    },

    getHistory: function () {
      return Promise.resolve(state.history)
    },

    completeUp: function (input) {
      var historyChanged = completion.historySize !== state.history.length
      var inputChanged = input !== completion.input
      if (inputChanged || historyChanged) {
        // reset completion
        completion.input = input
        completion.index = 0
        completion.historySize = state.history.length
        completion.list = state.history.filter(function (item) {
          return item.startsWith(input)
        }).reverse()
      } else if (completion.index < completion.list.length - 1) {
        completion.index++
      } else {
        return Promise.resolve(undefined)
      }
      return Promise.resolve(completion.list[completion.index])
    },

    completeDown: function (input) {
      if (input !== completion.input || !completion.index) {
        return Promise.resolve(undefined)
      }
      completion.index--
      return Promise.resolve(completion.list[completion.index])
    }
  }

  return emulator
}

function createState (initialState) {
  var state = defaultState()
  if (!initialState) {
    return state
  }
  Object.keys(state).forEach(function (key) {
    if (initialState[key]) {
      state[key] = initialState[key]
    }
  })
  return state
}

function defaultState () {
  return {
    history: [],
    fileSystem: {
      '/': {
        type: 'dir',
        modified: Date.now()
      },
      '/home': {
        type: 'dir',
        modified: Date.now()
      },
      '/home/user': {
        type: 'dir',
        modified: Date.now()
      }
    },
    user: 'user',
    workingDirectory: '/home/user'
  }
}

function joinPaths (a, b) {
  if (!b) {
    return a
  }
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
