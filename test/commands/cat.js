var test = require('tape')
var bashEmulator = require('../../src')

test('cat', function (t) {
  t.plan(2)
  var emulator = bashEmulator({
    workingDirectory: '/',
    fileSystem: {
      '/1.txt': {
        type: 'file',
        lastEdited: Date.now(),
        content: 'first'
      },
      '/2.txt': {
        type: 'file',
        lastEdited: Date.now(),
        content: 'second'
      },
      '/3.txt': {
        type: 'file',
        lastEdited: Date.now(),
        content: 'third'
      }
    }
  })
  emulator.run('cat 1.txt /3.txt /2.txt').then(function (output) {
    var res =
      'first' +
      '\n' +
      'third' +
      '\n' +
      'second'
    t.equal(output, res, 'cats multiple files')
  })
  emulator.run('cat nonexistend /1.txt').then(null, function (err) {
    var res =
      'cat: nonexistend: No such file or directory' +
      '\n' +
      'first'
    t.equal(err, res, 'with errors')
  })
})
