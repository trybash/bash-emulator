var test = require('tape')
var bashEmulator = require('../src')

test('initialise', function (t) {
  t.plan(1)
  var emulator = bashEmulator()
  t.equal(typeof emulator, 'object', 'emulator is an object')
})

test('initialise with state', function (t) {
  t.plan(1)
  var testState = {
    history: ['ls'],
    user: 'test',
    workingDirectory: '/home/test',
    fileSystem: {
      '/': {
        type: 'dir',
        lastEdited: Date.now()
      },
      '/home': {
        type: 'dir',
        lastEdited: Date.now()
      },
      '/home/test': {
        type: 'dir',
        lastEdited: Date.now()
      }
    }
  }
  var emulator = bashEmulator(testState)
  t.deepEqual(emulator.state, testState, 'emulator uses initial state')
})

test('run missing command', function (t) {
  t.plan(1)
  bashEmulator().run('nonexistend').then(null, function (err) {
    t.equals(err, 'nonexistend: command not found', 'error when running missing comand')
  })
})

test('change working directory', function (t) {
  t.plan(6)
  var emulator = bashEmulator()
  emulator.getDir().then(function (dir) {
    t.equal(dir, '/home/user', 'initial WD matches')
  }).then(function () {
    return emulator.changeDir('..')
  }).then(function () {
    return emulator.getDir()
  }).then(function (dir) {
    t.equal(dir, '/home', 'changes dir with ..')
  }).then(function () {
    return emulator.changeDir('./user')
  }).then(function () {
    return emulator.getDir()
  }).then(function (dir) {
    t.equal(dir, '/home/user', 'changes dir with relative path')
  }).then(function () {
    return emulator.changeDir('/')
  }).then(function () {
    return emulator.getDir()
  }).then(function (dir) {
    t.equal(dir, '/', 'changes dir with absolute path')
  }).then(function () {
    return emulator.changeDir('home/user')
  }).then(function () {
    return emulator.getDir()
  }).then(function (dir) {
    t.equal(dir, '/home/user', 'changes dir with chained path')
  }).then(function () {
    return emulator.changeDir('nonexistend')
  }).then(null, function (err) {
    t.equal(err, '/home/user/nonexistend: No such file or directory', 'cannot change to non-existend dir')
  })
})

test('update history', function (t) {
  t.plan(2)
  var emulator = bashEmulator()
  emulator.getHistory().then(function (history) {
    t.deepEqual(history, [], 'history is empty')
  }).then(function () {
    return emulator.run('ls /')
  }).then(function () {
    return emulator.getHistory()
  }).then(function (history) {
    t.deepEqual(history, ['ls /'], 'command get appended to history')
  })
})

test('reading files', function (t) {
  t.plan(4)
  var testState = {
    history: [],
    workingDirectory: '/',
    fileSystem: {
      '/': {
        type: 'dir',
        lastEdited: Date.now()
      },
      '/log.txt': {
        type: 'file',
        lastEdited: Date.now(),
        content: 'some log'
      }
    }
  }
  var emulator = bashEmulator(testState)
  emulator.read('nonexistend').then(null, function (err) {
    t.equal(err, 'nonexistend: No such file or directory', 'cannot read missing file')
  })
  emulator.read('/').then(null, function (err) {
    t.equal(err, '/: Is a directory', 'cannot read content of directory')
  })
  emulator.read('/log.txt').then(function (content) {
    t.equal(content, 'some log', 'read content of a file')
  })
  emulator.read('log.txt').then(function (content) {
    t.equal(content, 'some log', 'with relative path')
  })
})

test('reading a directory\'s content', function (t) {
  t.plan(4)
  var emulator = bashEmulator({
    fileSystem: {
      '/': {
        type: 'dir',
        lastEdited: Date.now()
      },
      '/home': {
        type: 'dir',
        lastEdited: Date.now()
      },
      '/home/user': {
        type: 'dir',
        lastEdited: Date.now()
      },
      '/etc': {
        type: 'dir',
        lastEdited: Date.now()
      },
      '/tmp.log': {
        type: 'file',
        lastEdited: Date.now(),
        content: 'log'
      }
    }
  })
  emulator.readDir('/home/user').then(function (listing) {
    t.deepEqual(listing, [], 'lists empty')
  })
  emulator.readDir('..').then(function (listing) {
    t.deepEqual(listing, ['user'], 'lists folder')
  })
  emulator.readDir('/').then(function (listing) {
    t.deepEqual(listing, ['etc', 'home', 'tmp.log'], 'lists in order')
  })
  emulator.readDir('nonexistend').then(null, function (err) {
    t.equal(err, 'cannot access nonexistend: No such file or directory', 'error for missing file')
  })
})

test('removing', function (t) {
  t.plan(4)
  var testState = {
    history: [],
    workingDirectory: '/',
    fileSystem: {
      '/': {
        type: 'dir',
        lastEdited: Date.now()
      },
      '/home': {
        type: 'dir',
        lastEdited: Date.now()
      },
      '/home/test': {
        type: 'dir',
        lastEdited: Date.now()
      },
      '/log.txt': {
        type: 'file',
        lastEdited: Date.now(),
        content: 'some log'
      }
    }
  }
  var emulator = bashEmulator(testState)
  emulator.remove('/nonexistend').then(null, function (err) {
    t.equal(err, 'cannot remove ‘/nonexistend’: No such file or directory', 'cannot remove non-existend file')
  })
  emulator.remove('/log.txt').then(function () {
    return emulator.remove('/log.txt')
  }).then(null, function () {
    t.ok(true, 'file is deleted')
  })
  emulator.remove('/home').then(function () {
    emulator.remove('/home').then(null, function () {
      t.ok(true, 'directory is deleted')
    })
    emulator.remove('/home/test').then(null, function () {
      t.ok(true, 'sub-directory is deleted')
    })
  })
})

test('completion', function (t) {
  t.plan(10)

  var emulator = bashEmulator({
    history: [
      'cd /home/user',
      'ls ..',
      'pwd',
      'ls',
      'ls test',
      'ls ..'
    ]
  })

  emulator.completeDown('ls').then(function (completion) {
    t.equal(completion, undefined, 'cannot go down')
    return emulator.completeUp('ls')
  }).then(function (completion) {
    t.equal(completion, 'ls ..', 'goes up')
    return emulator.completeUp('ls')
  }).then(function (completion) {
    t.equal(completion, 'ls test', 'goes up twice')
    return emulator.completeUp('ls')
  }).then(function (completion) {
    t.equal(completion, 'ls', 'includes base command too')
    return emulator.completeUp('ls')
  }).then(function (completion) {
    t.equal(completion, 'ls ..', 'commands can occur multiple times')
    return emulator.completeUp('ls')
  }).then(function (completion) {
    t.equal(completion, undefined, 'completion can be exhausted')
    return emulator.completeUp('ls')
  }).then(function (completion) {
    t.equal(completion, undefined, 'completion index stops with exhaustion')
    return emulator.completeDown('ls')
  }).then(function (completion) {
    t.equal(completion, 'ls', 'can go down again')
    return emulator.completeUp('cd /hom')
  }).then(function (completion) {
    t.equal(completion, 'cd /home/user', 'complete other command')
    return emulator.completeUp('ls')
  }).then(function (completion) {
    t.equal(completion, 'ls ..', 'completion is reset after command change')
  })
})

//
// running sub tests
//
require('./commands/pwd')
require('./commands/ls')
require('./commands/cd')
require('./commands/history')
require('./commands/cat')
