import fs from 'fs';
import cprocess from 'child_process';
import gulp from 'gulp';
import del from 'del';
import runSequence from 'run-sequence';
import chalk from 'chalk';
import webpack from 'webpack';

const $ = require('gulp-load-plugins')();
const browserSync = require('browser-sync').create();
const PRODUCTION = process.env.NODE_ENV === 'production';
const THEME = 'bk-blog';

gulp.task('assets:clean', () =>
  del([
    `hugo/themes/${THEME}/static/assets/**`,
    `hugo/themes/${THEME}/data/assets.json`,
    'build/assets/**',
  ])
);
gulp.task('assets:build', done => {
  const configWebpack = PRODUCTION
    ? require('./webpack.config.prod.js')
    : require('./webpack.config.dev.js');
  const webpackConfig = configWebpack(THEME);
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
  // const assets = require(`./hugo/themes/${THEME}/static/assets.json`);
  // For production, discard drafts and future content.
  const args = PRODUCTION
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
  // fs.writeFile(
  //   `hugo/themes/${THEME}/data/assets.json`,
  //   JSON.stringify(assets),
  //   'utf8',
  //   err => {
  //     if (err) {
  //       $.util.log('[hugo:build]', chalk.red(err));
  //       return done();
  //     }
  // Start hugo after asset injection.
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
  // }
  // );
});
gulp.task('hugo:clean', () =>
  del(['build/**', '!build', '!build/assets', '!build/assets/**/*'])
);
gulp.task('hugo', gulp.series('hugo:clean', 'hugo:build'));

gulp.task('all:build', gulp.series('assets:build', 'hugo:build'));
// gulp.task('all:clean', () => del(['hugo:clean', 'assets:clean']));
gulp.task('all:clean', gulp.series('assets:clean', 'hugo:clean'));
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
    gulp.watch(['src/**/*.{js,scss}'], gulp.series('assets'));
    gulp.watch(
      ['hugo/**/*', `!hugo/themes/${THEME}/data/assets.json`],
      gulp.series('hugo')
    );
  })
);
