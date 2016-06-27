require('string.prototype.startswith')
require('string.prototype.includes')

// NOTE: No support for files yet
function ls (env, args) {
  var task
  if (!args.length) {
    task = env.system.getDir()
      .then(env.system.readDir)
      .then(function (listing) {
        return listing.join(' ')
      })
  } else if (args.length === 1) {
    task = env.system.readDir(args[0]).then(function (listing) {
      return listing.join(' ')
    })
  } else {
    task = Promise.all(args.sort().map(function (path) {
      return env.system.readDir(path).then(function (listing) {
        return path + ':\n' + listing.join(' ')
      })
    })).then(function (listings) {
      return listings.join('\n\n')
    })
  }
  task.then(function (result) {
    env.output(result)
    env.exit()
  })
}

module.exports = ls
