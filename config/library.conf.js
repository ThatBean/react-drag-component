const NodeModulePath = require('path')
const config = require('./common.conf')

module.exports = Object.assign(config, {
  entry: {
    'index': './source/index'
  },
  output: {
    path: NodeModulePath.join(__dirname, '../library/'),
    filename: '[name].js',
    library: 'ReactDragComponent',
    libraryTarget: 'umd'
  },
  externals: {
    'react': 'react',
    'react-dom': 'react-dom',
    'react-redux': 'react-redux',
    'redux': 'redux'
  }
})
