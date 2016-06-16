function pwd (env, args) {
  env.output(env.system.state.workingDirectory)
  env.exit()
}

module.exports = pwd

