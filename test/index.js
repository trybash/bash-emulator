var test = require('tape')
var bashEmulator = require('../src')

test('initialise', function (t) {
  t.plan(1)
  var emulator = bashEmulator()
  t.equal(typeof emulator, 'object')
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
  t.deepEqual(emulator.state, testState)
})

test('run missing command', function (t) {
  t.plan(1)
  bashEmulator().run('nonexistend').then(null, function (err) {
    t.equals(err, 'nonexistend: command not found')
  })
})

test('change working directory', function (t) {
  t.plan(5)
  var emulator = bashEmulator()
  emulator.getDir().then(function (dir) {
    t.equal(dir, '/home/username')
  }).then(function () {
    return emulator.changeDir('..')
  }).then(function () {
    return emulator.getDir()
  }).then(function (dir) {
    t.equal(dir, '/home')
  }).then(function () {
    return emulator.changeDir('/')
  }).then(function () {
    return emulator.getDir()
  }).then(function (dir) {
    t.equal(dir, '/')
  }).then(function () {
    return emulator.changeDir('home/username')
  }).then(function () {
    return emulator.getDir()
  }).then(function (dir) {
    t.equal(dir, '/home/username')
  }).then(function () {
    return emulator.changeDir('nonexistend')
  }).then(function () {
    return emulator.getDir()
  }).then(null, function (err) {
    t.equal(err, '/home/username/nonexistend: No such file or directory')
  })
})

test('update history', function (t) {
  t.plan(2)
  var emulator = bashEmulator()
  emulator.getHistory().then(function (history) {
    t.deepEqual(history, [])
  }).then(function () {
    return emulator.run('ls')
  }).then(function () {
    return emulator.getHistory()
  }).then(function (history) {
    t.deepEqual(history, ['ls'])
  })
})

test('reading files', function (t) {
  t.plan(3)
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
  emulator.read('/nonexistend').then(null, function (err) {
    t.equal(err, '/nonexistend: No such file or directory')
  })
  emulator.read('/').then(null, function (err) {
    t.equal(err, '/: Is a directory')
  })
  emulator.read('/log.txt').then(function (content) {
    t.equal(content, 'some log')
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
    t.equal(err, 'cannot remove ‘/nonexistend’: No such file or directory')
  })
  emulator.remove('/log.txt').then(function () {
    t.equal(emulator.state.fileSystem['/log.txt'], undefined)
  })
  emulator.remove('/home').then(function () {
    t.equal(emulator.state.fileSystem['/home'], undefined)
    t.equal(emulator.state.fileSystem['/home/test'], undefined)
  })
})

