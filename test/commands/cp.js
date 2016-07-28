var test = require('tape')
var bashEmulator = require('../../src')

test('cp', function (t) {
  t.plan(25)

  var emulator = bashEmulator({
    history: [],
    user: 'test',
    workingDirectory: '/',
    fileSystem: {
      '/': {
        type: 'dir',
        modified: Date.now()
      },
      '/a': {
        type: 'file',
        modified: Date.now(),
        content: 'aaa'
      },
      '/b': {
        type: 'file',
        modified: Date.now(),
        content: 'bbb'
      },
      '/c': {
        type: 'file',
        modified: Date.now(),
        content: 'ccc'
      },
      '/d': {
        type: 'dir',
        modified: Date.now()
      },
      '/e': {
        type: 'dir',
        modified: Date.now()
      },
      '/e/subdir': {
        type: 'dir',
        modified: Date.now()
      }
    }
  })

  emulator.run('cp').then(null, function (output) {
    t.equal(output, 'cp: missing file operand', 'fail without args')
  })

  emulator.run('cp somefile').then(null, function (output) {
    t.equal(output, 'cp: missing destination file operand after ‘somefile’', 'fail without destination')
  })

  emulator.run('cp nofile testdir').then(null, function (output) {
    t.equal(output, 'nofile: No such file or directory', 'fail if file non-existent')
  })

  emulator.run('cp d testdir').then(null, function (output) {
    t.equal(output, 'cp: omitting directory ‘d’', 'fail copying a directory')
  })

  emulator.run('cp a aa')
    .then(function (output) {
      t.equal(output, '', 'no output on success')
      return emulator.read('a')
    })
    .then(function (output) {
      t.equal(output, 'aaa', 'old file exists')
      return emulator.read('aa')
    })
    .then(function (output) {
      t.equal(output, 'aaa', 'copy to new file')
    })

  emulator.run('cp a b')
    .then(function (output) {
      t.equal(output, '', 'no output on success')
      return emulator.read('a')
    })
    .then(function (output) {
      t.equal(output, 'aaa', 'old file exists')
      return emulator.read('b')
    })
    .then(function (output) {
      t.equal(output, 'aaa', 'overwrite file')
    })

  emulator.run('cp a d')
    .then(function (output) {
      t.equal(output, '', 'no output on success')
      return emulator.read('a')
    })
    .then(function (output) {
      t.equal(output, 'aaa', 'old file exists')
      return emulator.read('d/a')
    })
    .then(function (output) {
      t.equal(output, 'aaa', 'copy to directory')
    })

  emulator.run('cp a b c').then(null, function (output) {
    t.equal(output, 'cp: target ‘c’ is not a directory', 'fail if copying multiple files to file')
  })

  emulator.run('cp a b /non/existent').then(null, function (output) {
    t.equal(output, 'cp: target ‘/non/existent’ is not a directory', 'fail if copying multiple files to missing directory')
  })

  emulator.run('cp a c d')
    .then(function (output) {
      t.equal(output, '', 'copy multiple files to directory')
      return emulator.read('a')
    })
    .then(function (output) {
      t.equal(output, 'aaa', 'old a exists')
      return emulator.read('c')
    })
    .then(function (output) {
      t.equal(output, 'ccc', 'old c exists')
      return emulator.read('d/a')
    })
    .then(function (output) {
      t.equal(output, 'aaa', 'new a exists')
      return emulator.read('d/c')
    })
    .then(function (output) {
      t.equal(output, 'ccc', 'new c exists')
    })

  emulator.run('cp -r e new-location')
    .then(function (output) {
      t.equal(output, '', 'copy directory')
      return emulator.stat('e')
    })
    .then(function () {
      t.ok(true, 'old directory is still there')
      return emulator.stat('e/subdir')
    })
    .then(function () {
      t.ok(true, 'old sub-directory is still there')
      return emulator.stat('new-location')
    })
    .then(function () {
      t.ok(true, 'create new directory')
      return emulator.stat('new-location/subdir')
    })
    .then(function () {
      t.ok(true, 'create new sub-directory')
    })
})
