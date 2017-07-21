import fs from 'fs';
import cprocess from 'child_process';
import gulp from 'gulp';
import del from 'del';
import runSequence from 'run-sequence';
import chalk from 'chalk';
import webpack from 'webpack';

const $ = require('gulp-load-plugins')();
const browserSync = require('browser-sync').create();
const production = process.env.NODE_ENV === 'production';

gulp.task('assets', done => runSequence('assets:clean', 'assets:build', done));
gulp.task('assets:build', done => {
  const webpackConfig = production
    ? require('./webpack.config.prod.js')
    : require('./webpack.config.dev.js');
  webpack(webpackConfig, (err, stats) => {
    if (err) {
      $.log('[assets:build]', chalk.red(err));
      return done();
    }
    $.util.log('[webpack]', stats.toString({ colors: true, progress: true }));
    done();
  });
});
gulp.task('assets:clean', () => del(['build/assets/**', 'build/assets.json']));

// Depends on assets tasks.
gulp.task('hugo', done => runSequence('hugo:clean', 'hugo:build', done));
gulp.task('hugo:build', done => {
  // Our hugo build requires asset paths produced by webpack. This is useful
  // when they're appended by hashes for cache busting.
  const assets = require('./hugo/static/assets.json');
  // For production, discard drafts and future content.
  const args = production
    ? ['-d', `${__dirname}/build`, '-s', 'hugo']
    : [
        '-d',
        `${__dirname}/build`,
        '-s',
        'hugo',
        '--buildDrafts',
        '--buildFuture',
      ];
  // Inject assets to the data directory where hugo can pick up.
  fs.writeFile('hugo/data/assets.json', JSON.stringify(assets), 'utf8', err => {
    if (err) {
      $.util.log('[hugo:build]', chalk.red(err));
      return done();
    }
    // Start hugo after asset injection.
    cprocess.spawn('hugo', args, { stdio: 'inherit' }).on('close', code => {
      if (code === 0) {
        if (!production) {
          browserSync.reload();
        }
      } else {
        $.util.log(
          '[hugo:build]',
          chalk.red('Unable to start hugo process. Code ' + code)
        );
      }
      done();
    });
  });
});
gulp.task('hugo:clean', () => del(['build/**']));

gulp.task('all', done => runSequence('all:clean', 'all:build', done));
gulp.task('all:build', done => runSequence('assets:build', 'hugo:build', done));
gulp.task('all:clean', () => del(['build']));

gulp.task('server', ['all'], () => {
  browserSync.init({
    server: {
      baseDir: 'build',
    },
    open: false,
    notify: false,
  });
  // Whenever we make a change in src directory, webpack's output
  // to the hugo directory rebuilds hugo.
  gulp.watch(['src/**/*'], ['assets']);
  gulp.watch(['hugo/**/*', '!hugo/data/assets.json'], ['hugo']);
});
