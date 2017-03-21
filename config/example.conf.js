const config = require('./common.conf')

module.exports = Object.assign(
  {},
  config,
  {
    entry: {
      'index': ['babel-polyfill', './example/source/index']
    },
    output: {
      path: './example/',
      filename: '[name].js',
      library: 'ReactDragComponent',
      libraryTarget: 'umd'
    },
  }
)
