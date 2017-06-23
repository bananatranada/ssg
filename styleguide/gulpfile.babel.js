import _ from 'lodash';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import runSequence from 'run-sequence';
import BrowserSync from 'browser-sync';
import requireDir from 'require-dir';
import chalk from 'chalk';
import configWebpack from '../webpack.config';

// styleguide is only used in development mode
const $ = {
  ...gulpLoadPlugins(),
  ..._.mapValues(requireDir('../gulp/plugins'), obj => obj.default),
};
const tasks = _.mapValues(requireDir('../gulp/tasks'), obj => obj.default);
const browserSync = BrowserSync.create();

const config = {
  scss: {
    minify: $.util.env.env === 'production',
    sourcemap: $.util.env.env === 'production',
    src: '../src/scss/main.scss',
    dest: './public/css',
    config: { includePaths: ['../node_modules'] },
    bsStream: browserSync.stream,
    watchpath: ['../src/scss/**/*.scss'],
    cleanpath: ['./public/css/main*.css*'],
    onSuccess() {
      if ($.util.env.env !== 'production') {
        console.log('success');
        browserSync.stream();
      }
    },
    onError(err) {
      console.log(chalk.red('[css:build]\n' + err));
    },
  },
  js: {
    config: configWebpack({
      env: $.util.env.env,
      src: '../src/js/app.js',
      dest: './public/js',
    }),
    watchpath: ['../src/js/**/*.js'],
    cleanpath: ['./public/js/app*.js*'],
    onSuccess() {
      if ($.util.env.env !== 'production') {
        browserSync.reload();
      }
    },
    onError(err) {
      console.log(chalk.red('[hugo:build]\n' + err));
      if ($.util.env.env !== 'production') {
        browserSync.notify(err);
      }
    },
  },
  media: {
    src: './src/media/**',
    dest: './public',
    minify: $.util.env.env === 'production',
    watchpath: ['./src/media/**'],
    cleanpath: [
      './public/favicon.*',
      './public/fonts/**',
      './public/images/**',
      './public/videos/**',
    ],
    onSuccess() {
      if ($.util.env.env !== 'production') {
        browserSync.reload();
      }
    },
    onError(err) {
      console.log(chalk.red('[media:build]\n' + err));
      if ($.util.env.env !== 'production') {
        browserSync.notify(err);
      }
    },
  },
  astrum: {
    watchpath: [
      './public/index.html',
      './public/data.json',
      './public/components/**',
      './public/pages/**',
    ],
  },
};

gulp.task('scss', done => runSequence('scss:clean', 'scss:build', done));
gulp.task('scss:build', tasks.buildScss($, config.scss));
gulp.task('scss:clean', () => del(config.scss.cleanpath));

gulp.task('js', done => runSequence('js:clean', 'js:build', done));
gulp.task('js', tasks.buildJs($, config.js));
gulp.task('js:clean', () => del(config.js.cleanpath));

gulp.task('media', done => runSequence('media:clean', 'media:build', done));
gulp.task('media', tasks.buildMedia($, config.media));
gulp.task('media:clean', () => del(config.media.cleanpath));

gulp.task('all', ['scss', 'js', 'media']);
gulp.task('all:build', ['scss:build', 'js:build', 'media:build']);
gulp.task('all:clean', ['scss:clean', 'js:clean', 'media:clean']);

gulp.task('server', ['all'], () => {
  browserSync.init({
    server: {
      baseDir: './public',
    },
    open: false,
    notify: config.env !== 'production',
  });
  gulp.watch(config.scss.watchpath, ['scss']);
  gulp.watch(config.js.watchpath, ['js']);
  gulp.watch(config.media.watchpath, ['media']);
  gulp.watch(config.astrum.watchpath, () => browserSync.reload());
});
