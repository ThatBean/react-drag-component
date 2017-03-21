const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const POSTCSS_LOADER = { loader: 'postcss-loader', options: { plugins: () => [ require('postcss-cssnext') ] } }

const PRODUCTION = process.env.NODE_ENV === 'production'
console.log('PRODUCTION', PRODUCTION)

module.exports = {
  // entry: {},
  // output: {},
  module: {
    rules: [
      { test: /\.js$/, use: [ 'babel-loader' ], exclude: /node_modules/ },
      { test: /\.pcss$/, use: ExtractTextPlugin.extract({ use: [ 'css-loader?importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]', POSTCSS_LOADER ] }) }
    ]
  },
  plugins: PRODUCTION
    ? [ new ExtractTextPlugin('index.css'), new webpack.DefinePlugin({ 'process.env': { NODE_ENV: JSON.stringify('production') } }), new webpack.optimize.UglifyJsPlugin() ]
    : [ new ExtractTextPlugin('index.css') ]
}
