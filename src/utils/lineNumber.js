function addLineNumber (width, num, line) {
  var numChars = num.toString().length
  var space = ' '.repeat(width - numChars)
  return space + num + '  ' + line
}
module.exports.addLineNumber = addLineNumber

module.exports.addLineNumbers = function (width, lines) {
  return lines.map(function (line, i) {
    var num = i + 1
    return addLineNumber(width, num, line)
  })
}
