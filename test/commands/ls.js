var test = require('tape')
var bashEmulator = require('../../src')

test('ls', function (t) {
  t.plan(10)

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
        modified: new Date('Jun 27 2016 17:30').getTime()
      },
      '/home': {
        type: 'dir',
        modified: new Date('Jul 23 2016 13:47').getTime()
      },
      '/home/test': {
        type: 'dir',
        modified: Date.now()
      },
      '/home/test/README': {
        type: 'file',
        modified: new Date('Jan 01 2016 03:35').getTime(),
        content: 'read this first'
      },
      '/home/test/.secret': {
        type: 'file',
        modified: new Date('May 14 2016 07:10').getTime(),
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
    t.equal(err, 'ls: cannot access ‘nonexistent’: No such file or directory', 'missing dir')
  })

  emulator.run('ls /home/test').then(function (output) {
    t.equal(output, 'README', 'list without hidden files')
  })

  emulator.run('ls -a /home/test').then(function (output) {
    t.equal(output, '.secret README', 'show hidden files with la -a')
  })

  emulator.run('ls -l /').then(function (output) {
    var listing =
      'total 2' +
      '\n' +
      'dir   Jun 27 17:30  etc' +
      '\n' +
      'dir   Jul 23 13:47  home' +
      '\n' +
      'The output here is limited.' +
      '\n' +
      'On a real system you would also see file permissions, user, group, block size and more.'
    t.equal(output, listing, 'more info with ls -l')
  })

  emulator.run('ls -l -a /home/test').then(function (output) {
    var listing =
      'total 2' +
      '\n' +
      'file  May 14 07:10  .secret' +
      '\n' +
      'file  Jan 01 03:35  README' +
      '\n' +
      'The output here is limited.' +
      '\n' +
      'On a real system you would also see file permissions, user, group, block size and more.'
    t.equal(output, listing, 'combine -a and -l')
  })

  emulator.run('ls -la /home/test').then(function (output) {
    var listing =
      'total 2' +
      '\n' +
      'file  May 14 07:10  .secret' +
      '\n' +
      'file  Jan 01 03:35  README' +
      '\n' +
      'The output here is limited.' +
      '\n' +
      'On a real system you would also see file permissions, user, group, block size and more.'
    t.equal(output, listing, 'combine -a and -l')
  })

  emulator.run('ls -al /home/test').then(function (output) {
    var listing =
      'total 2' +
      '\n' +
      'file  May 14 07:10  .secret' +
      '\n' +
      'file  Jan 01 03:35  README' +
      '\n' +
      'The output here is limited.' +
      '\n' +
      'On a real system you would also see file permissions, user, group, block size and more.'
    t.equal(output, listing, 'combine -a and -l')
  })
})

