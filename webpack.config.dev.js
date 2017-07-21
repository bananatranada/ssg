import path from 'path';
import webpack from 'webpack';
import ManifestPlugin from 'webpack-manifest-plugin';

module.exports = {
  entry: './src/js/index.js',
  output: {
    path: path.resolve('hugo/static'),
    filename: 'assets/js/bundle.js',
    publicPath: '/',
  },
  module: {
    loaders: [
      { test: /\.json$/, loader: 'json-loader' },
      {
        loader: 'babel-loader',
        test: /\.js?$/,
        exclude: /node_modules/,
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
      fileName: 'assets.json',
      publicPath: '/',
    }),
  ],
};
