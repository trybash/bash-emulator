function mv (env, args) {
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

  if (files.length === 1) {
    var file = files[0]
    env.system.stat(destination).then(function (stats) {
      if (stats.type === 'dir') {
        var filePathParts = file.split('/')
        var fileName = filePathParts[filePathParts.length - 1]
        return destination + '/' + fileName
      }
      return destination
    }, function () {
      return destination
    }).then(function (dest) {
      env.system.rename(file, dest).then(function () {
        env.exit(0)
      }, function (err) {
        env.error(err)
        env.exit(1)
      })
    })
    return
  }

  // multiple files
  env.system.stat(destination).then(function (stats) {
    if (stats.type !== 'dir') {
      return Promise.reject()
    }
    Promise.all(files.map(function (file) {
      var filePathParts = file.split('/')
      var fileName = filePathParts[filePathParts.length - 1]
      var dest = destination + '/' + fileName
      return env.system.rename(file, dest)
    })).then(function () {
      env.exit(0)
    }, function (err) {
      env.error(err)
      env.exit(1)
    })
  }).catch(function () {
    env.error('mv: target ‘' + destination + '’ is not a directory')
    env.exit(1)
  })
}

module.exports = mv
