var test = require('tape')
var bashEmulator = require('../../src')

test('pwd', function (t) {
  t.plan(1)

  var emulator = bashEmulator({
    workingDirectory: '/'
  })

  emulator.run('pwd').then(function (dir) {
    t.equal(dir, '/', 'returns working directory')
  })
})

