var test = require('tape')
var bashEmulator = require('./bash-emulator')

test('runs ls', function (t) {
  t.plan(1)

  var emulator = bashEmulator('test-emulator')

  emulator.run('ls')
    .then(function (result) {
      t.equal(result, 'ran ls')
    })
})
