// NOTE: No support for files yet
function ls (env, args) {
  var aFlagIndex = args.findIndex(function (arg) {
    return arg === '-a'
  })
  var showHidden = aFlagIndex !== -1
  if (showHidden) {
    args.splice(aFlagIndex, 1)
  }

  function excludeHidden (listing) {
    if (showHidden) {
      return listing
    }
    return listing.filter(function (item) {
      return item[0] !== '.'
    })
  }

  var task
  if (args.length < 2) {
    task = env.system.readDir(args[0])
      .then(excludeHidden)
      .then(function (listing) {
        return listing.join(' ')
      })
  } else {
    task = Promise.all(args.sort().map(function (path) {
      return env.system.readDir(path)
        .then(excludeHidden)
        .then(function (listing) {
          return path + ':\n' + listing.join(' ')
        })
    })).then(function (listings) {
      return listings.join('\n\n')
    })
  }
  task.then(function (result) {
    env.output(result)
    env.exit()
  }, function (err) {
    env.output('ls: ' + err)
    env.exit(2)
  })
}

module.exports = ls
