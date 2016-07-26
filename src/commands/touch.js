function touch (env, args) {
  if (!args.length) {
    env.error('touch: missing file operand')
    env.exit(1)
    return
  }

  args.map(function (file) {
    env.system.write(file, '').then(function () {
      env.exit()
    }, function (err) {
      env.error(err)
      env.exit(1)
    })
  })
}

module.exports = touch
