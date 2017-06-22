import gulp from 'gulp';

export default function buildMedia($, options) {
  const { src, dest, minify } = options;
  return () =>
    gulp.src(src).pipe($.if(minify, $.imagemin())).pipe(gulp.dest(dest));
}
