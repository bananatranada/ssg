import path from 'path';
import webpack from 'webpack';
import ManifestPlugin from 'webpack-manifest-plugin';
var BrowserSyncPlugin = require('browser-sync-webpack-plugin');

module.exports = {
  entry: ['webpack-hot-middleware/client', './src/js/index.js'],
  output: {
    path: path.resolve('build'),
    filename: 'static/assets/js/bundle.js',
    publicPath: '/',
  },
  module: {
    loaders: [
      { test: /\.json$/, loader: 'json-loader' },
      {
        loader: 'babel-loader',
        test: /\.js?$/,
        exclude: /node_modules/,
        query: { cacheDirectory: true },
      },
      {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    // only for modules that get exported; modules setting globals with windows don't work
    new webpack.ProvidePlugin({
      fetch: 'imports?this=>global!exports?global.fetch!whatwg-fetch',
    }),
    new ManifestPlugin({
      fileName: 'assets-manifest.json',
      publicPath: '/',
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
};
