const NodeModulePath = require('path')
const config = require('./common.conf')

module.exports = Object.assign(config, {
  entry: { 'index': './source/index' },
  output: {
    path: NodeModulePath.join(__dirname, '../library/'),
    filename: '[name].js',
    library: 'ReactDragComponent',
    libraryTarget: 'umd'
  },
  externals: {
    'react': 'react',
    'react-dom': 'react-dom',
    'prop-types': 'prop-types',
    'hammerjs': 'hammerjs',
    'state-scheme': 'state-scheme',
    'react-context-store': 'react-context-store'
  }
})
