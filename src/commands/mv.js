var SINGLE_COPY = 'SINGLE_COPY'

function mv (env, args) {
  var nFlagIndex = args.findIndex(function (arg) {
    return arg === '-n'
  })

  var noClobber = nFlagIndex !== -1
  if (noClobber) {
    args.splice(nFlagIndex, 1)
  }

  if (!args.length) {
    env.error('mv: missing file operand')
    env.exit(1)
    return
  }
  if (args.length === 1) {
    env.error('mv: missing destination file operand after ‘' + args[0] + '’')
    env.exit(1)
    return
  }

  var destination = args[args.length - 1]
  var files = args.slice(0, -1)

  function rename (file, dest) {
    if (noClobber) {
      return env.system.stat(dest).catch(function () {
        return env.system.copy(file, dest).then(function () {
          return env.system.remove(file)
        })
      })
    }
    return env.system.copy(file, dest).then(function () {
      return env.system.remove(file)
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
        return Promise.reject('mv: target ‘' + destination + '’ is not a directory')
      }
      return SINGLE_COPY
    })
    .then(function (actionType) {
      if (actionType === SINGLE_COPY) {
        return rename(files[0], destination)
      }
      return Promise.all(files.map(function (file) {
        var filePathParts = file.split('/')
        var fileName = filePathParts[filePathParts.length - 1]
        var dest = destination + '/' + fileName
        return rename(file, dest)
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

module.exports = mv
