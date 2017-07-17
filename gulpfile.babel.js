import _ from 'lodash';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import runSequence from 'run-sequence';
import BrowserSync from 'browser-sync';
import requireDir from 'require-dir';
import chalk from 'chalk';
import configWebpack from './webpack.config';

const $ = {
  ...gulpLoadPlugins(),
  ..._.mapValues(requireDir('./gulp/plugins'), obj => obj.default),
};
const tasks = _.mapValues(requireDir('./gulp/tasks'), obj => obj.default);
const browserSync = BrowserSync.create();

const config = {
  scss: {
    minify: $.util.env.env === 'production',
    sourcemap: $.util.env.env === 'production',
    src: './src/scss/main.scss',
    dest: './public/css',
    config: { includePaths: ['./node_modules'] },
    bsStream: browserSync.stream,
    watchpath: ['src/scss/**/*.scss'], // don't use ./ or absolute /
    cleanpath: ['./public/css/main*.css*'],
    onSuccess() {
      if ($.util.env.env !== 'production') {
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
      src: './src/js/app.js',
      dest: './public/js',
    }),
    watchpath: ['./src/js/**/*.js'],
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
    watchpath: ['./src/media/**/*'],
    cleanpath: [
      './public/favicon.*',
      './public/fonts/**',
      './public/images/**',
      './public/videos/**',
    ],
  },
  hugo: {
    env: $.util.env.env,
    datapath: './src/site/data/global.json',
    watchpath: ['./src/site/**/*'],
    cleanpath: ['./public/**/*.{html,xml}'],
    args: $.util.env.env === 'production'
      ? ['-d', `${__dirname}/public`, '-s', './src/site']
      : [
          '-d',
          `${__dirname}/public`,
          '-s',
          './src/site',
          '--buildDrafts',
          '--buildFuture',
        ],
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
};

gulp.task('scss', done => runSequence('scss:clean', 'scss:build', done));
gulp.task('scss:build', tasks.buildScss($, config.scss));
gulp.task('scss:clean', () => del(config.scss.cleanpath));

gulp.task('js', done => runSequence('js:clean', 'js:build', done));
gulp.task('js:build', tasks.buildJs($, config.js));
gulp.task('js:clean', () => del(config.js.cleanpath));

gulp.task('media', done => runSequence('media:clean', 'media:build', done));
gulp.task('media:build', tasks.buildMedia($, config.media));
gulp.task('media:clean', () => del(config.media.cleanpath));

gulp.task('hugo', done => runSequence('hugo:clean', 'hugo:build', done));
gulp.task('hugo:build', tasks.buildHugo($, config.hugo));
gulp.task('hugo:clean', () => del(config.hugo.cleanpath));

gulp.task('all', ['scss', 'js', 'hugo', 'media']);
gulp.task('all:build', ['scss:build', 'js:build', 'hugo:build', 'media:build']);
gulp.task('all:clean', () => del(['./public/**']));

gulp.task('server', ['all'], () => {
  browserSync.init({
    server: {
      baseDir: './public',
    },
    open: false,
    notify: false,
  });
  gulp.watch(config.scss.watchpath, ['scss']);
  gulp.watch(config.js.watchpath, ['js']);
  gulp.watch(config.hugo.watchpath, ['hugo']);
  gulp.watch(config.media.watchpath, ['media']);
});
