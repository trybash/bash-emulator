function pwd (env, args) {
  env.system.getDir().then(function (dir) {
    env.output(dir)
    env.exit()
  })
}

module.exports = pwd

