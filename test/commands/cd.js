var test = require('tape')
var bashEmulator = require('../../src')

test('cd', function (t) {
  t.plan(3)

  var emulator = bashEmulator({
    history: [],
    user: 'test',
    workingDirectory: '/',
    fileSystem: {
      '/': {
        type: 'dir',
        modified: Date.now()
      },
      '/home': {
        type: 'dir',
        modified: Date.now()
      },
      '/home/test': {
        type: 'dir',
        modified: Date.now()
      }
    }
  })

  emulator.run('cd')
    .then(function () {
      return emulator.getDir()
    })
    .then(function (dir) {
      t.equal(dir, '/home/test', 'go to users\'s home')
    })
    .then(function () {
      return emulator.run('cd /home')
    })
    .then(function () {
      return emulator.getDir()
    })
    .then(function (dir) {
      t.equal(dir, '/home', 'absolute path')
    })
    .then(function () {
      return emulator.run('cd nonexistent')
    })
    .then(null, function (err) {
      t.equal(err, '/home/nonexistent: No such file or directory', 'error message')
    })
})

