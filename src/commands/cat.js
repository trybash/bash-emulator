var addLineNumbers = require('../utils/lineNumber')

var numColumnWidth = 6
var numberFlag = '-n'

function cat (env, args) {
  var exitCode = 0
  var numberFlagIndex = args.findIndex(function (arg) {
    return arg === numberFlag
  })
  var showNumbers = numberFlagIndex !== -1
  if (showNumbers) {
    args.splice(numberFlagIndex, 1)
  }
  Promise
    .all(args.map(function (path) {
      return env.system.read(path).then(null, function (err) {
        exitCode = 1
        return 'cat: ' + err
      })
    }))
    .then(function (contents) {
      if (!showNumbers) {
        return contents
      }
      return addLineNumbers(numColumnWidth, contents)
    })
    .then(function (contents) {
      env.output(contents.join('\n'))
      env.exit(exitCode)
    })
}

module.exports = cat
