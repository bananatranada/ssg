import gulp from 'gulp';
import webpack from 'webpack';

/**
 * js:build task
 * @param $
 * @param options
 * @param options.src
 * @param options.dest
 * @param options.env
 * @param options.config
 */
export default function buildJs($, options) {
  return done => {
    const { config, onSuccess, onError } = options;
    webpack(config, (err, stats) => {
      if (err) {
        onError(err);
        return done();
      }
      $.util.log('[webpack]', stats.toString({ colors: true, progress: true }));
      onSuccess();
      return done();
    });
  };
}
