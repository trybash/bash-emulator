var bashEmulator = function (name) {
  return {
    run: function (cmd) {
      return Promise.resolve('ran ' + cmd)
    }
  }
}

module.exports = bashEmulator
