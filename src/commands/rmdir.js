function rmdir (env, args) {
  if (!args.length) {
    env.error('rmdir: missing operand')
    env.exit(1)
    return
  }

  Promise
    .all(args.map(function (path) {
      return env.system.stat(path)
        .then(function (stats) {
          if (stats.type !== 'dir') {
            return Promise.reject('rmdir: cannot remove ‘' + path + '’: Not a directory')
          }
        }, function () {})
        .then(function () {
          return env.system.readDir(path)
        })
        .then(function (files) {
          if (files.length) {
            return Promise.reject('rmdir: failed to remove ‘' + path + '’: Directory not empty')
          }
        })
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

module.exports = rmdir
