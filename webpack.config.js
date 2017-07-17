var path = require('path');
var webpack = require('webpack');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');

export default function configWebpack(options) {
  const { src, dest, env } = options;
  const config = {
    entry: {
      app: [src],
    },
    output: {
      path: path.resolve(dest),
      filename: '[name].js',
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
      ],
    },
    plugins: [
      // only for modules that get exported; modules setting globals with windows don't work
      new webpack.ProvidePlugin({
        fetch: 'imports?this=>global!exports?global.fetch!whatwg-fetch',
      }),
    ],
  };

  if (env === 'production') {
    // Add production-specific plugins
    config.plugins = [
      ...config.plugins,
      new UglifyJsPlugin({
        sourceMap: true,
      }),
    ];

    // Exclude external libraries for CDN (This says to get them from window)
    // config.externals = {
    //   ...config.externals,
    //   jquery: 'jQuery',
    //   tether: 'Tether',
    // };

    // Add min to filename
    config.output.filename = '[name].min.js';
  }

  return config;
}
