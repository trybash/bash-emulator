var test = require('tape')
var bashEmulator = require('../../src')

test('mkdir', function (t) {
  t.plan(7)

  var emulator = bashEmulator({
    workingDirectory: '/',
    fileSystem: {
      '/': {
        type: 'dir',
        modified: Date.now()
      }
    }
  })

  emulator.run('mkdir dirname')
    .then(function () {
      return emulator.stat('dirname')
    })
    .then(function (stat) {
      t.equal(stat.name, 'dirname', 'directory created')
    })

  emulator.run('mkdir dir1 dir2')
    .then(function () {
      return emulator.stat('dir1')
    })
    .then(function (stat) {
      t.equal(stat.name, 'dir1', 'first directory created')
    })
    .then(function () {
      return emulator.stat('dir2')
    })
    .then(function (stat) {
      t.equal(stat.name, 'dir2', 'second directory created')
    })

  emulator.run('mkdir').then(null, function (output) {
    t.equal(output, 'mkdir: missing operand', 'fail without argument')
  })

  emulator.run('mkdir non/existent/path').then(null, function (err) {
    t.equal(err, '/non/existent: No such file or directory', 'fail with non-existent location')
  })

  emulator.run('mkdir somedir non/existent/path')
    .then(null, function (err) {
      t.equal(err, '/non/existent: No such file or directory', 'fail with non-existent location')
    })
    .then(function () {
      return emulator.stat('somedir')
    })
    .then(function (stat) {
      t.equal(stat.type, 'dir', 'create at existing location')
    })
})
