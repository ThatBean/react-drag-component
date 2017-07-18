const NodeModulePath = require('path')
const config = require('./common.conf')

module.exports = Object.assign(config, {
  entry: { 'index': [ './example/source/index' ] },
  output: {
    path: NodeModulePath.join(__dirname, '../example/'),
    filename: '[name].js',
    library: 'ReactDragComponent',
    libraryTarget: 'umd'
  }
})
