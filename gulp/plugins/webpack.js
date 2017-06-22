import webpack from 'webpack';
import through from 'through2';
import gutil from 'gulp-util';

// options = {
//   env: '',
//   config: '',
// src: ''
// dest:
// }
/**
 * hugo plugin for gulp
 * @param options
 * @param options.src
 * @param options.dest
 * @param options.env
 * @param options.config
 */
export default function webpackPlugin(options) {
  const { src, dest, env, config } = options;
  return through.obj((file, encoding, cb) => {
    webpack(config, (err, stats) => {
      if (err) {
        return cb(new gutil.PluginError('webpack plugin', err));
      }
      gutil.log('[webpack]', stats.toString({ colors: true, progress: true }));
      return cb(null, file);
    });
  });
}
