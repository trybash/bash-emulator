require('string.prototype.startswith')
require('string.prototype.includes')

function ls (env, args) {
  var state = env.system.state
  var cwd = state.workingDirectory
  var listing = Object.keys(state.fileSystem)
    .filter(function (path) {
      return (
        path.startsWith(cwd) &&
        !path.substr(cwd.length).includes('/') &&
        path !== cwd
      )
    })
    .map(function (path) {
      return path.substr(cwd.length)
    })
  env.output(listing.join(' '))
  env.exit()
}

module.exports = ls
