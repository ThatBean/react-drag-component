const nodeModulePath = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const { DefinePlugin, BannerPlugin, optimize: { ModuleConcatenationPlugin } } = webpack

const { NODE_ENV = 'production' } = process.env
const IS_PRODUCTION = NODE_ENV === 'production'

const OPTIONS = {
  BABEL_LOADER: IS_PRODUCTION
    ? { presets: [ [ 'es2015', { modules: false } ], 'stage-0', 'react' ] }
    : { presets: [ 'stage-0', 'react' ] },
  CSS_LOADER: IS_PRODUCTION
    ? { importLoaders: 1, localIdentName: '[hash:base64:12]' }
    : { importLoaders: 1, localIdentName: '[name]_[local]_[hash:base64:5]' },
  POSTCSS_LOADER: { plugins: () => [ require('postcss-cssnext') ] }
}

module.exports = {
  // entry: {},
  // output: {},
  resolve: {
    alias: {
      source: nodeModulePath.resolve(__dirname, '../source'),
      example: nodeModulePath.resolve(__dirname, '../example/source')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          { loader: 'babel-loader', options: OPTIONS.BABEL_LOADER }
        ]
      },
      {
        test: /\.pcss$/,
        use: ExtractTextPlugin.extract({
          use: [
            { loader: 'css-loader', options: OPTIONS.CSS_LOADER },
            { loader: 'postcss-loader', options: OPTIONS.POSTCSS_LOADER }
          ]
        })
      }
    ]
  },

  plugins: [].concat(
    new ExtractTextPlugin('index.css'),
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      '__DEV__': !IS_PRODUCTION
    }),
    IS_PRODUCTION ? [
      new ModuleConcatenationPlugin(),
      new BannerPlugin({ banner: '/* eslint-disable */', raw: true, test: /\.js$/, entryOnly: false }),
      new BannerPlugin({ banner: '/* stylelint-disable */', raw: true, test: /\.css$/, entryOnly: false })
    ] : []
  )
}
