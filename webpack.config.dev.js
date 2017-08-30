import path from 'path';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import ManifestPlugin from 'webpack-manifest-plugin';

// module.exports = function(THEME) {
//   return {
//     entry: './src/js/index.js',
//     output: {
//       path: path.resolve(`hugo/themes/${THEME}/static`),
//       filename: 'assets/js/bundle.js',
//       publicPath: '/',
//     },
//     module: {
//       rules: [
//         { test: /\.json$/, loader: 'json-loader' },
//         {
//           loader: 'babel-loader',
//           test: /\.js?$/,
//           exclude: /node_modules/,
//         },
//         {
//           test: /\.scss$/,
//           // use: ExtractTextPlugin.extract({
//           // fallback: 'style-loader',
//           use: [
//             'style-loader',
//             { loader: 'css-loader', options: { importLoaders: 1 } },
//             'sass-loader',
//           ],
//           // }),
//         },
//       ],
//     },
//     plugins: [
//       // only for modules that get exported; modules setting globals with windows don't work
//       new webpack.ProvidePlugin({
//         fetch: 'imports?this=>global!exports?global.fetch!whatwg-fetch',
//       }),
//       // new ExtractTextPlugin('assets/css/main.css'),
//       new ManifestPlugin({
//         fileName: '../data/assets.json',
//         publicPath: '/',
//       }),
//     ],
//   };
// };

module.exports = {
  entry: './src/js/index.js',
  output: {
    path: path.resolve('static/assets'),
    filename: 'js/bundle.js',
    publicPath: '/',
  },
  module: {
    rules: [
      { test: /\.json$/, loader: 'json-loader' },
      {
        loader: 'babel-loader',
        test: /\.js?$/,
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            // 'style-loader',
            { loader: 'css-loader', options: { importLoaders: 1 } },
            'sass-loader',
          ],
        }),
      },
    ],
  },
  plugins: [
    // only for modules that get exported; modules setting globals with windows don't work
    new webpack.ProvidePlugin({
      fetch: 'imports?this=>global!exports?global.fetch!whatwg-fetch',
    }),
    new ExtractTextPlugin('css/main.css'),
    new ManifestPlugin({
      fileName: 'assets_manifest.json', // Go templates can't take -, so use _
      publicPath: '/assets/', // prepend /assets/ to the asset paths
    }),
  ],
};
