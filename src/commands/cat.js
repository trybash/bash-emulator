function cat (env, args) {
  var exitCode = 0
  Promise.all(args.map(function (path) {
    return env.system.read(path).then(null, function (err) {
      exitCode = 1
      return 'cat: ' + err
    })
  })).then(function (contents) {
    env.output(contents.join('\n'))
    env.exit(exitCode)
  })
}

module.exports = cat
