!(function () {
  var bashEmulator = function (name) {
    return {
      name: name,

      run: function (cmd) {
        return Promise.resolve('ran ' + cmd)
      }
    }
  }

  // browser
  if (this.window) {
    window.bashEmulator = bashEmulator
  }
  // node.js
  if (this.global) {
    module.exports = bashEmulator
  }
})()
