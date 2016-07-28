var test = require('tape')
var bashEmulator = require('../../src')

function emulator () {
  return bashEmulator({
    history: [],
    user: 'test',
    workingDirectory: '/',
    fileSystem: {
      '/': {
        type: 'dir',
        modified: Date.now()
      },
      '/etc': {
        type: 'dir',
        modified: Date.now()
      },
      '/README': {
        type: 'file',
        modified: Date.now(),
        content: 'read this first'
      },
      '/err.log': {
        type: 'file',
        modified: Date.now(),
        content: 'some err'
      },
      '/somedir': {
        type: 'dir',
        modified: Date.now()
      },
      '/somedir/subdir': {
        type: 'dir',
        modified: Date.now()
      }
    }
  })
}

test('mv', function (t) {
  t.plan(33)

  emulator().run('mv').then(null, function (output) {
    t.equal(output, 'mv: missing file operand', 'fail without args')
  })

  emulator().run('mv somefile').then(null, function (output) {
    t.equal(output, 'mv: missing destination file operand after ‘somefile’', 'fail without destination')
  })

  emulator().run('mv nofile testdir').then(null, function (output) {
    t.equal(output, 'nofile: No such file or directory', 'fail if file non-existent')
  })

  var mul1 = emulator()
  mul1.run('mv README DONTREADME')
    .then(function (output) {
      t.equal(output, '', 'no output on success')
      return mul1.read('DONTREADME')
    })
    .then(function (output) {
      t.equal(output, 'read this first', 'new file exists')
      return mul1.read('README')
    })
    .then(null, function (output) {
      t.equal(output, 'README: No such file or directory', 'old file is gone')
    })

  var mul2 = emulator()
  mul2.run('mv README etc')
    .then(function (output) {
      t.equal(output, '', 'no output on success')
      return mul2.read('etc/README')
    })
    .then(function (output) {
      t.equal(output, 'read this first', 'move file to directory')
      return mul2.read('README')
    })
    .then(null, function (output) {
      t.equal(output, 'README: No such file or directory', 'old file is gone')
    })

  var mul3 = emulator()
  mul3.run('mv README err.log')
    .then(function (output) {
      t.equal(output, '', 'no output on success')
      return mul3.read('err.log')
    })
    .then(function (output) {
      t.equal(output, 'read this first', 'move and overwrite a file')
      return mul3.read('README')
    }).then(null, function (output) {
      t.equal(output, 'README: No such file or directory', 'old file is gone')
    })

  emulator().run('mv README err.log README').then(null, function (output) {
    t.equal(output, 'mv: target ‘README’ is not a directory', 'fail if moving multiple files to file')
  })

  emulator().run('mv README err.log /non/existent').then(null, function (output) {
    t.equal(output, 'mv: target ‘/non/existent’ is not a directory', 'fail if moving multiple files to missing directory')
  })

  var mul4 = emulator()
  mul4.run('mv README err.log /etc')
    .then(function (output) {
      t.equal(output, '', 'move multiple files to dir')
      return mul4.read('err.log')
    })
    .then(null, function (output) {
      t.equal(output, 'err.log: No such file or directory', 'old err.log is gone')
      return mul4.read('README')
    })
    .then(null, function (output) {
      t.equal(output, 'README: No such file or directory', 'old README is gone')
      return mul4.read('etc/err.log')
    })
    .then(function (output) {
      t.equal(output, 'some err', 'new err.log exists')
      return mul4.read('etc/README')
    })
    .then(function (output) {
      t.equal(output, 'read this first', 'new README exists')
    })

  var mul5 = emulator()
  mul5.run('mv README non-existent /etc')
    .then(null, function (output) {
      t.equal(output, 'non-existent: No such file or directory', 'with multiple files and one failing others are still moved')
      return mul5.read('README')
    })
    .then(function () {
    }, function (output) {
      t.equal(output, 'README: No such file or directory', 'old README is gone')
    })
    .then(function () {
      return mul5.read('etc/README')
    })
    .then(function (output) {
      t.equal(output, 'read this first', 'new README exists')
    })

  var mul6 = emulator()
  mul6.run('mv -n README err.log')
    .then(function (output) {
      t.equal(output, '', 'no output on success')
      return mul6.read('README')
    })
    .then(function (output) {
      t.equal(output, 'read this first', 'source file is still there')
      return mul6.read('err.log')
    }).then(function (output) {
      t.equal(output, 'some err', 'destination file unchanged')
    })

  var mul7 = emulator()
  mul7.run('mv -n README new-location')
    .then(function (output) {
      t.equal(output, '', 'no output on success')
      return mul7.read('README')
    })
    .then(null, function (output) {
      t.ok(true, 'old file is gone')
      return mul7.read('new-location')
    }).then(function (output) {
      t.equal(output, 'read this first', 'create new file')
    })

  var mul8 = emulator()
  mul8.run('mv somedir othername')
    .then(function (output) {
      t.equal(output, '', 'no output on success')
      return mul8.stat('somedir')
    })
    .then(null, function () {
      t.ok(true, 'old directory is gone')
      return mul8.stat('somedir/subdir')
    })
    .then(null, function () {
      t.ok(true, 'old sub-directory is gone')
      return mul8.stat('othername')
    })
    .then(function () {
      t.ok(true, 'directory is at new location')
      return mul8.stat('othername/subdir')
    }, function () {
      console.log(arguments)
    })
    .then(function () {
      t.ok(true, 'sub-directory has been moved too')
    })
})
