var commands = {
  cat: require('./cat'),
  cd: require('./cd'),
  history: require('./history'),
  ls: require('./ls'),
  mkdir: require('./mkdir'),
  mv: require('./mv'),
  pwd: require('./pwd'),
  touch: require('./touch')
}

module.exports = commands
