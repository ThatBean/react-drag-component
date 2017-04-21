const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const POSTCSS_LOADER = { loader: 'postcss-loader', options: { plugins: () => [ require('postcss-cssnext') ] } }

const NODE_ENV = process.env.NODE_ENV
const PRODUCTION = NODE_ENV === 'production'
console.log({ NODE_ENV, PRODUCTION })

module.exports = {
  // entry: {},
  // output: {},
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader', options: { cacheDirectory: true, plugins: [ 'transform-runtime' ] } }
      },
      {
        test: /\.pcss$/,
        use: ExtractTextPlugin.extract({ use: [ `css-loader?importLoaders=1&localIdentName=${PRODUCTION ? '[hash:base64:12]' : '[name]__[local]___[hash:base64:5]'}`, POSTCSS_LOADER ] })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('index.css'),
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify(NODE_ENV) })
  ]
}
