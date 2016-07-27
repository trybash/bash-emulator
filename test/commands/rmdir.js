var test = require('tape')
var bashEmulator = require('../../src')

test('rmdir', function (t) {
  t.plan(7)

  var emulator = bashEmulator({
    workingDirectory: '/',
    fileSystem: {
      '/': {
        type: 'dir',
        modified: Date.now()
      },
      '/dir1': {
        type: 'dir',
        modified: Date.now(),
        content: ''
      },
      '/dir2': {
        type: 'dir',
        modified: Date.now(),
        content: ''
      },
      '/dir3': {
        type: 'dir',
        modified: Date.now(),
        content: ''
      },
      '/dir4': {
        type: 'dir',
        modified: Date.now(),
        content: ''
      },
      '/somefile': {
        type: 'dir',
        modified: Date.now()
      }
    }
  })

  emulator.run('rmdir dir1')
    .then(function () {
      return emulator.stat('dir1')
    })
    .then(null, function () {
      t.ok(true, 'remove directory')
    })

  emulator.run('rmdir dir2 dir3')
    .then(function () {
      return emulator.stat('dir2')
    })
    .then(null, function () {
      t.ok(true, 'remove first directory')
    })
    .then(function () {
      return emulator.stat('dir3')
    })
    .then(null, function () {
      t.ok(true, 'remove second directory')
    })

  emulator.run('rmdir').then(null, function (output) {
    t.equal(output, 'rmdir: missing operand', 'fail without argument')
  })

  emulator.run('rmdir non/existent/path').then(null, function (err) {
    t.equal(err, 'cannot remove ‘non/existent/path’: No such file or directory', 'fail with non-existent location')
  })

  emulator.run('rmdir dir4 non/existent/path somefile')
    .then(null, function (err) {
      t.equal(err, 'cannot remove ‘non/existent/path’: No such file or directory', 'fail with non-existent location')
    })
    .then(function () {
      return emulator.stat('dir4')
    })
    .then(null, function () {
      t.ok(true, 'remove first directory')
    })
})
