var test = require('tape')
var bashEmulator = require('../src')

test('runs ls', function (t) {
  t.plan(1)

  var emulator = bashEmulator()

  emulator.run('ls')
    .then(function (result) {
      t.equal(result, '')
    })
})

// initialise
// initialise with state
