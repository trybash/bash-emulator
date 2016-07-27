var test = require('tape')
var bashEmulator = require('../../src')

test('rmdir', function (t) {
  t.plan(9)

  var emulator = bashEmulator({
    workingDirectory: '/',
    fileSystem: {
      '/': {
        type: 'dir',
        modified: Date.now()
      },
      '/dir1': {
        type: 'dir',
        modified: Date.now()
      },
      '/dir2': {
        type: 'dir',
        modified: Date.now()
      },
      '/dir3': {
        type: 'dir',
        modified: Date.now()
      },
      '/dir4': {
        type: 'dir',
        modified: Date.now()
      },
      '/nonemptydir': {
        type: 'dir',
        modified: Date.now()
      },
      '/nonemptydir/file': {
        type: 'file',
        modified: Date.now(),
        content: ''
      },
      '/somefile': {
        type: 'file',
        modified: Date.now(),
        content: ''
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
    t.equal(err, 'cannot access ‘non/existent/path’: No such file or directory', 'fail with non-existent location')
  })

  emulator.run('rmdir dir4 non/existent/path somefile')
    .then(null, function (err) {
      t.equal(err, 'cannot access ‘non/existent/path’: No such file or directory', 'fail with non-existent location')
    })
    .then(function () {
      return emulator.stat('dir4')
    })
    .then(null, function () {
      t.ok(true, 'remove first directory')
    })

  emulator.run('rmdir somefile').then(null, function (err) {
    t.equal(err, 'rmdir: cannot remove ‘somefile’: Not a directory', 'Fail when trying to remove a file')
  })

  emulator.run('rmdir nonemptydir').then(null, function (err) {
    t.equal(err, 'rmdir: failed to remove ‘nonemptydir’: Directory not empty', 'fail when trying to remove a non-empty directory')
  })
})
