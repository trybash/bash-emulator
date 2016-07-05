require('string.prototype.repeat')

// default width for number column
var numColumnWidth = 5

function history (env) {
  env.system.getHistory().then(function (history) {
    env.output(history.map(function (item, i) {
      var num = i + 1
      var numChars = num.toString().length
      var space = ' '.repeat(numColumnWidth - numChars)
      return space + num + '  ' + item
    }).join('\n'))
    env.exit()
  })
}

module.exports = history

