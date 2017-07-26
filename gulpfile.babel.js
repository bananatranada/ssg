// THEME BOILERPLATE (use as submodule)

import fs from 'fs-extra';
import cprocess from 'child_process';
import gulp from 'gulp';
import del from 'del';
import runSequence from 'run-sequence';
import chalk from 'chalk';
import webpack from 'webpack';

const $ = require('gulp-load-plugins')();
const browserSync = require('browser-sync').create();
const PRODUCTION = process.env.NODE_ENV === 'production';

gulp.task('assets:clean', () => del(['static/assets/**']));
gulp.task('assets:build', done => {
  const webpackConfig = PRODUCTION
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
gulp.task('assets', gulp.series('assets:clean', 'assets:build'));

// Depends on assets tasks.
gulp.task('hugo:build', done => {
  // Our hugo build requires asset paths produced by webpack. This is useful
  // when they're appended by hashes for cache busting.
  // For production, discard drafts and future content.
  const args = PRODUCTION
    ? ['-d', `${__dirname}/build`, '-s', 'site', '--themesDir=../..']
    : [
        '-d',
        `${__dirname}/build`,
        '-s',
        'site',
        '--buildDrafts',
        '--buildFuture',
        '--themesDir=../..',
      ];
  // Start hugo after asset injection.
  fs.copy(
    'static/assets/assets_manifest.json',
    'data/assets_manifest.json',
    err => {
      if (err) return $.util.log('[hugo:build]', chalk.red(err));

      cprocess.spawn('hugo', args, { stdio: 'inherit' }).on('close', code => {
        if (code === 0) {
          if (!PRODUCTION) {
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
    }
  );
});
gulp.task('hugo:clean', () =>
  del(['build/**', '!build', '!build/assets', '!build/assets/**/*'])
);
gulp.task('hugo', gulp.series('hugo:clean', 'hugo:build'));

gulp.task('all:build', gulp.series('assets:build', 'hugo:build'));
gulp.task('all:clean', gulp.parallel('assets:clean', 'hugo:clean'));
gulp.task('all', gulp.series('all:clean', 'all:build'));

gulp.task(
  'server',
  gulp.series('all', () => {
    browserSync.init({
      server: {
        baseDir: 'build',
      },
      open: false,
      notify: false,
    });
    // Whenever we make a change in src directory, webpack's output
    // to the hugo directory rebuilds hugo.
    gulp.watch(['src/**/*.{js,scss}'], gulp.series('assets', 'hugo'));
    // Ignore files that are changed by the assets task. When we run the
    // assets task, we run hugo after, so no need to watch it here.
    gulp.watch(
      [
        'site/**/*',
        'data/**/*',
        `!data/assets_manifest.json`, // cuz hugo:build is creating it
        'layouts/**/*',
        'static/**/*',
        '!static/assets/**/*', // cuz webpack is creating it
      ],
      gulp.series('hugo')
    );
  })
);
