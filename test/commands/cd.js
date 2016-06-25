var test = require('tape')
var bashEmulator = require('../../src')

test('cd', function (t) {
  t.plan(3)
  var testState = {
    history: [],
    user: 'test',
    workingDirectory: '/',
    fileSystem: {
      '/': {
        type: 'dir',
        lastEdited: Date.now()
      },
      '/home': {
        type: 'dir',
        lastEdited: Date.now()
      },
      '/home/test': {
        type: 'dir',
        lastEdited: Date.now()
      }
    }
  }
  var emulator = bashEmulator(testState)
  emulator.run('cd').then(function () {
    return emulator.getDir()
  }).then(function (dir) {
    t.equal(dir, '/home/test')
  }).then(function () {
    return emulator.run('cd /home')
  }).then(function () {
    return emulator.getDir()
  }).then(function (dir) {
    t.equal(dir, '/home')
  }).then(function () {
    return emulator.run('cd nonexistend')
  }).then(null, function (err) {
    t.equal(err, '/home/nonexistend: No such file or directory')
  })
})

