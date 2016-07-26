var test = require('tape')
var bashEmulator = require('../../src')

test('touch', function (t) {
  t.plan(6)

  var fileInitTime = Date.now()

  var emulator = bashEmulator({
    workingDirectory: '/',
    fileSystem: {
      '/': {
        type: 'dir',
        modified: Date.now()
      },
      '/file.txt': {
        type: 'file',
        modified: fileInitTime,
        content: 'first'
      }
    }
  })

  emulator.run('touch').then(null, function (output) {
    t.equal(output, 'touch: missing file operand', 'fail without argument')
  })

  emulator.run('touch 1.txt 2.txt')
    .then(function () {
      return emulator.stat('1.txt')
    })
    .then(function (stat) {
      t.equal(stat.name, '1.txt', 'first file created')
    })
    .then(function () {
      return emulator.stat('2.txt')
    })
    .then(function (stat) {
      t.equal(stat.name, '2.txt', 'second file created')
    })

  setTimeout(function () {
    emulator.run('touch file.txt')
      .then(function (output) {
        t.equal(output, '', 'no output')
      })
      .then(function () {
        return emulator.stat('file.txt')
      })
      .then(function (stat) {
        t.notEqual(stat.modified, fileInitTime, 'update modifed timestamp')
      })
  }, 50)

  emulator.run('touch non/existent/filepath')
    .then(null, function (err) {
      t.equal(err, '/non/existent: No such file or directory', 'fail with non-existent file location')
    })
})
