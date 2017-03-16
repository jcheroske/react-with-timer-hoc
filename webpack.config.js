const { resolve } = require('path')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const webpack = require('webpack')

const [ DEV, PROD ] = [ 'development', 'production' ].map(val => process.env.NODE_ENV === val)

module.exports = {
  context: __dirname,
  devtool: PROD ? 'nosources-source-map' : 'source-map',
  entry: './src/index.js',
  externals: {
    'invariant': 'invariant',
    'lodash': {
      root: '_',
      commonjs2: 'lodash',
      commonjs: 'lodash',
      amd: 'lodash'
    },
    'react': 'react',
    'warning': 'warning'
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader'
      },
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  output: {
    filename: 'index.js',
    library: 'ReactWithTimer',
    libraryTarget: 'umd',
    path: resolve(__dirname, './dist')
  },
  plugins: [
    new webpack.EnvironmentPlugin([ 'NODE_ENV' ]),
    new webpack.DefinePlugin({
      DEV: JSON.stringify(DEV),
      PROD: JSON.stringify(PROD)
    }),

    ...(PROD ? [new UglifyJSPlugin({
      compressor: {
        unsafe: true
      }
    })] : [])
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: ['lib', 'node_modules']
  },
  target: 'web'
}
