function addLineNumbers (width, list) {
  return list.map(function (item, i) {
    var num = i + 1
    var numChars = num.toString().length
    var space = ' '.repeat(width - numChars)
    return space + num + '  ' + item
  })
}

module.exports = addLineNumbers
