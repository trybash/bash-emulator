function cd (env, args) {
  env.system.changeDir(args[0]).then(
    env.exit,
    function (errorMessage) {
      env.error(errorMessage)
      env.exit(1)
    }
  )
}

module.exports = cd

