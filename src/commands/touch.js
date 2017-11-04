function touch (env, args) {
  // Ignore command name
  args.shift()

  if (!args.length) {
    env.error('touch: missing file operand')
    env.exit(1)
    return
  }

  Promise
    .all(args.map(function (file) {
      return env.system.write(file, '')
    }))
    .then(function () {
      env.exit()
    }, function (err) {
      env.error(err)
      env.exit(1)
    })
}

module.exports = touch
