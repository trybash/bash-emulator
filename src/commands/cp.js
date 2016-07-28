var SINGLE_COPY = 'SINGLE_COPY'

function cp (env, args) {
  var rFlagIndex = args.findIndex(function (arg) {
    return arg === '-r' || arg === '-R'
  })
  var isRecursive = rFlagIndex !== -1
  if (isRecursive) {
    args.splice(rFlagIndex, 1)
  }

  if (!args.length) {
    env.error('cp: missing file operand')
    env.exit(1)
    return
  }
  if (args.length === 1) {
    env.error('cp: missing destination file operand after ‘' + args[0] + '’')
    env.exit(1)
    return
  }

  var destination = args[args.length - 1]
  var files = args.slice(0, -1)

  function copy (file, dest) {
    return env.system.stat(file).then(function (stats) {
      if (stats.type === 'dir' && !isRecursive) {
        return Promise.reject('cp: omitting directory ‘' + file + '’')
      }
      return env.system.copy(file, dest)
    })
  }

  env.system.stat(destination)
    .then(function (stats) {
      if (stats.type !== 'dir') {
        return Promise.reject()
      }
    })
    .catch(function () {
      if (files.length !== 1) {
        return Promise.reject('cp: target ‘' + destination + '’ is not a directory')
      }
      return SINGLE_COPY
    })
    .then(function (actionType) {
      if (actionType === SINGLE_COPY) {
        return copy(files[0], destination)
      }
      return Promise.all(files.map(function (file) {
        var filePathParts = file.split('/')
        var fileName = filePathParts[filePathParts.length - 1]
        var dest = destination + '/' + fileName
        return copy(file, dest)
      }))
    })
    .then(function () {
      env.exit(0)
    })
    .catch(function (err) {
      env.error(err)
      env.exit(1)
    })
}

module.exports = cp
