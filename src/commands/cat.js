var lineNumber = require('../utils/lineNumber')

var numColumnWidth = 6
var numberFlag = '-n'

function cat (env, args) {
  // Ignore command name
  args.shift()

  var exitCode = 0
  var numberFlagIndex = args.findIndex(function (arg) {
    return arg === numberFlag
  })
  var showNumbers = numberFlagIndex !== -1
  if (showNumbers) {
    args.splice(numberFlagIndex, 1)
  }

  if (!args.length) {
    var num = 1
    return {
      input: function (str) {
        str.split('\n').forEach(function (l) {
          if (!l) {
            return
          }
          var line = showNumbers ? lineNumber.addLineNumber(numColumnWidth, num, l) : l
          num++
          env.output(line + '\n')
        })
      },
      close: function () {
        env.exit(exitCode)
      }
    }
  }

  Promise
    .all(args.map(function (path) {
      return env.system.read(path).then(null, function (err) {
        exitCode = 1
        return 'cat: ' + err
      })
    }))
    .then(function (contents) {
      var lines = showNumbers ? lineNumber.addLineNumbers(numColumnWidth, contents) : contents
      lines.forEach(function (line) {
        env.output(line + '\n')
      })
      env.exit(exitCode)
    })
}

module.exports = cat
