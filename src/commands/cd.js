function cd (env, args) {
  env.system.state.workingDirectory = args[0]
  env.exit()
}

module.exports = cd

