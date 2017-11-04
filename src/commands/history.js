var lineNumber = require('../utils/lineNumber')

// default width for number column
var numColumnWidth = 5

function history (env) {
  env.system.getHistory().then(function (history) {
    env.output(lineNumber.addLineNumbers(numColumnWidth, history).join('\n'))
    env.exit()
  })
}

module.exports = history

