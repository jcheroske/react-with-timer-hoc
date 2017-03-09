'use strict'
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')

const { DefinePlugin } = require('webpack')

const { DEV, PROD, TEST } = require('./env')

const define =
  new DefinePlugin({
    DEV,
    PROD,
    TEST
  })

const lodash = new LodashModuleReplacementPlugin()

module.exports = {
  define,
  plugins: [
    define,
    lodash
  ]
}
