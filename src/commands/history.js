require('string.prototype.repeat')

function history (env) {
  env.system.getHistory().then(function (history) {
    var hChars = history.length.toString().length
    env.output(history.map(function (item, i) {
      var num = i + 1
      var numChars = num.toString().length
      var space = ' '.repeat(hChars - numChars)
      return space + num + ' ' + item
    }).join('\n'))
    env.exit()
  })
}

module.exports = history

