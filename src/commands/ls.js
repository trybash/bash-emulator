// NOTE: No support for files yet

var disclaimer =
  '\n' +
  'The output here is limited.' +
  '\n' +
  'On a real system you would also see file permissions, user, group, block size and more.'

function ls (env, args) {
  var aFlagIndex = args.findIndex(function (arg) {
    return arg === '-a'
  })
  var showHidden = aFlagIndex !== -1
  if (showHidden) {
    args.splice(aFlagIndex, 1)
  }

  var lFlagIndex = args.findIndex(function (arg) {
    return arg === '-l'
  })
  var longFormat = lFlagIndex !== -1
  if (longFormat) {
    args.splice(lFlagIndex, 1)
  }

  var laFlagIndex = args.findIndex(function (arg) {
    return arg === '-la'
  })
  if (laFlagIndex !== -1) {
    showHidden = true
    longFormat = true
    args.splice(laFlagIndex, 1)
  }

  var alFlagIndex = args.findIndex(function (arg) {
    return arg === '-al'
  })
  if (alFlagIndex !== -1) {
    showHidden = true
    longFormat = true
    args.splice(alFlagIndex, 1)
  }

  if (!args.length) {
    args.push('.')
  }

  function excludeHidden (listing) {
    if (showHidden) {
      return listing
    }
    return listing.filter(function (item) {
      return item[0] !== '.'
    })
  }

  function formatListing (base, listing) {
    if (!longFormat) {
      return Promise.resolve(listing.join(' '))
    }
    return Promise.all(listing.map(function (filePath) {
      return env.system.stat(base + '/' + filePath).then(function (stats) {
        var date = new Date(stats.modified)
        var timestamp = date.toDateString().slice(4, 10) + ' ' + date.toTimeString().slice(0, 5)
        var type = stats.type
        // Manual aligning for now
        if (type === 'dir') {
          type += ' '
        }
        return type + '  ' + timestamp + '  ' + stats.name
      })
    })).then(function (lines) {
      return 'total ' + lines.length + '\n' + lines.join('\n') + disclaimer
    })
  }

  Promise.all(args.sort().map(function (path) {
    return env.system.readDir(path)
      .then(excludeHidden)
      .then(function (listing) {
        return formatListing(path, listing)
      })
      .then(function (formattedListing) {
        if (args.length === 1) {
          return formattedListing
        }
        return path + ':\n' + formattedListing
      })
  }))
  .then(function (listings) {
    return listings.join('\n\n')
  })
  .then(function (result) {
    env.output(result)
    env.exit()
  }, function (err) {
    env.output('ls: ' + err)
    env.exit(2)
  })
}

module.exports = ls
