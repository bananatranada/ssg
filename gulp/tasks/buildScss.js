import through from 'through2';
import gulp from 'gulp';
import cssnext from 'postcss-cssnext';

// const options = {
//   src
//   dest
//   config
//   env
//   onSuccess
//   onError
// }
export default function buildScss($, options) {
  const {
    src,
    dest,
    config,
    env,
    onSuccess,
    onError,
    minify,
    sourcemap,
    bsStream,
  } = options;
  return done => {
    return gulp
      .src(src)
      .pipe($.if(sourcemap, $.sourcemaps.init()))
      .pipe(
        $.sass(config).on('error', function(err) {
          onError(err.messageFormatted);
          this.emit('end');
        }),
      )
      .pipe($.postcss([cssnext]))
      .pipe($.if(minify, $.cleanCss()))
      .pipe($.if(minify, $.rename(path => (path.basename += '.min'))))
      .pipe($.if(sourcemap, $.sourcemaps.write('.')))
      .pipe(gulp.dest(dest))
      .pipe(bsStream());
  };
}
