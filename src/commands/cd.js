function cd (env, args) {
  var path = args[0] || '/home/' + env.system.state.user

  env.system.changeDir(path).then(
    env.exit,
    function (errorMessage) {
      env.error(errorMessage)
      env.exit(1)
    }
  )
}

module.exports = cd

