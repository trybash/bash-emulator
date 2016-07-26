var test = require('tape')
var bashEmulator = require('../../src')

test('ls', function (t) {
  t.plan(6)

  var emulator = bashEmulator({
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
      '/home': {
        type: 'dir',
        modified: Date.now()
      },
      '/home/test': {
        type: 'dir',
        modified: Date.now()
      },
      '/home/test/README': {
        type: 'file',
        modified: Date.now(),
        content: 'read this first'
      },
      '/home/test/.secret': {
        type: 'file',
        modified: Date.now(),
        content: 'this file is hidden'
      }
    }
  })

  emulator.run('ls').then(function (output) {
    t.equal(output, 'etc home', 'without args')
  })

  emulator.run('ls home').then(function (output) {
    t.equal(output, 'test', 'list dir')
  })

  emulator.run('ls home /').then(function (output) {
    var listing =
      '/:' +
      '\n' +
      'etc home' +
      '\n' +
      '\n' +
      'home:' +
      '\n' +
      'test'
    t.equal(output, listing, 'list multiple')
  })

  emulator.run('ls nonexistent').then(null, function (err) {
    t.equal(err, 'ls: cannot access nonexistent: No such file or directory', 'missing dir')
  })

  emulator.run('ls /home/test').then(function (output) {
    t.equal(output, 'README', 'list without hidden files')
  })

  emulator.run('ls -a /home/test').then(function (output) {
    t.equal(output, '.secret README', 'la -a -> hidden files')
  })
})

