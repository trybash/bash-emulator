function rm (env, args) {
  var rFlagIndex = args.findIndex(function (arg) {
    return arg.toLowerCase() === '-r'
  })
  var recursive = rFlagIndex !== -1
  if (recursive) {
    args.splice(rFlagIndex, 1)
  }

  if (!args.length) {
    env.error('rm: missing operand')
    env.exit(1)
    return
  }

  Promise
    .all(args.map(function (path) {
      return env.system.stat(path)
        .then(function (stats) {
          var isDir = stats.type === 'dir'
          if (isDir && !recursive) {
            return Promise.reject('rm: cannot remove ‘' + path + '’: Is a directory')
          }
        }, function () {})
        .then(function () {
          return env.system.remove(path)
        })
    }))
    .then(function () {
      env.exit()
    }, function (err) {
      env.error(err)
      env.exit(1)
    })
}

module.exports = rm
