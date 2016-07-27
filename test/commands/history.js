var test = require('tape')
var bashEmulator = require('../../src')

test('history', function (t) {
  t.plan(2)

  var emulator = bashEmulator()

  emulator.run('pwd')
    .then(function () {
      return emulator.run('nonexistent cmd')
    })
    .then(null, function () {
      return emulator.run('history')
    })
    .then(function (history) {
      t.equal(history, '    1  pwd\n    2  nonexistent cmd\n    3  history', 'appends to history')
    })

  var emulatorLong = bashEmulator({
    history: ['ls', 'ls', 'ls', 'ls', 'ls', 'ls', 'ls', 'ls', 'ls', 'ls']
  })

  emulatorLong.run('history').then(function (history) {
    var res =
    '    1  ls\n' +
    '    2  ls\n' +
    '    3  ls\n' +
    '    4  ls\n' +
    '    5  ls\n' +
    '    6  ls\n' +
    '    7  ls\n' +
    '    8  ls\n' +
    '    9  ls\n' +
    '   10  ls\n' +
    '   11  history'
    t.equal(history, res, 'formats history')
  })
})
