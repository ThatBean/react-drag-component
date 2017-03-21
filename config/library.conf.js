const config = require('./common.conf')

module.exports = Object.assign(
  {},
  config,
  {
    entry: {
      'index': './source/index'
    },
    output: {
      path: './library/',
      filename: '[name].js',
      library: 'MB_WORKFLOW_BETA',
      libraryTarget: 'umd'
    },
    externals: {
      'react': 'react',
      'react-dom': 'react-dom',
      'react-redux': 'react-redux',
      'redux': 'redux'
    }
  }
)
