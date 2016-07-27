function mkdir (env, args) {
  if (!args.length) {
    env.error('mkdir: missing operand')
    env.exit(1)
    return
  }

  Promise
    .all(args.map(function (path) {
      return env.system.createDir(path)
    }))
    .then(function () {
      env.exit()
    }, function (err) {
      env.error(err)
      env.exit(1)
    })
}

module.exports = mkdir
