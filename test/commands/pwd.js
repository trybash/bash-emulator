var test = require('tape')
var bashEmulator = require('../../src')

test('pwd', function (t) {
  t.plan(1)
  var testState = {
    workingDirectory: '/'
  }
  var emulator = bashEmulator(testState)
  emulator.run('pwd').then(function (dir) {
    t.equal(dir, '/')
  })
})

