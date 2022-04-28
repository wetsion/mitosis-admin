const { defineConfig } = require('@vue/cli-service');
const path = require('path');

module.exports = defineConfig({
  transpileDependencies: true,
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'scss',
      patterns: [
        path.resolve(__dirname, 'src/styles/_variables.scss'),
        path.resolve(__dirname, 'src/styles/_mixins.scss')
      ]
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        crypto: false
      },
      fallback: {
        path: require.resolve("path-browserify"),
        crypto: require.resolve("crypto-browserify")
      }
    }
  }
});
