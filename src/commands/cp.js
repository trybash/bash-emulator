var SINGLE_COPY = 'SINGLE_COPY'

function cp (env, args) {
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
    return env.system.remove(dest)
      .catch(function () {})
      .then(function () {
        return env.system.read(file)
      })
      .then(function (content) {
        return env.system.write(dest, content)
      })
  }

  env.system.stat(destination).then(function (stats) {
    if (stats.type !== 'dir') {
      return Promise.reject()
    }
  }).catch(function () {
    if (files.length === 1) {
      return SINGLE_COPY
    }
    return Promise.reject('cp: target ‘' + destination + '’ is not a directory')
  }).then(function (actionType) {
    if (actionType === SINGLE_COPY) {
      return copy(files[0], destination)
    }
    return Promise.all(files.map(function (file) {
      var filePathParts = file.split('/')
      var fileName = filePathParts[filePathParts.length - 1]
      var dest = destination + '/' + fileName
      return copy(file, dest)
    }))
  }).then(function () {
    env.exit(0)
  }).catch(function (err) {
    env.error(err)
    env.exit(1)
  })
}

module.exports = cp
