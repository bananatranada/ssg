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

const webpackConfig = production
  ? require('./webpack.config.prod.js')
  : require('./webpack.config.dev.js');
const compiler = webpack(webpackConfig);

gulp.task('assets', done => runSequence('assets:clean', 'assets:build', done));
gulp.task('assets:build', done => {
  compiler.run((err, stats) => {
    if (err) {
      console.log(chalk.red('[assets:build]\n' + err));
      return done();
    }
    $.util.log('[webpack]', stats.toString({ colors: true, progress: true }));
    done();
  });
});
gulp.task('assets:clean', () =>
  del(['build/static/assets/**', 'build/assets-manifest.json'])
);

gulp.task('public', done => runSequence('public:clean', 'public:build', done));
gulp.task('public:build', () => {
  return gulp.src('public/**/*').pipe($.imagemin()).pipe(gulp.dest('build'));
});
gulp.task('public:clean', () =>
  del([
    'build/static/**',
    '!build/static',
    '!build/static/assets',
    'build/favicon.{ico,png}',
  ])
);

// read build/asset-manifest.json after webpack finishes
gulp.task('hugo', done => runSequence('hugo:clean', 'hugo:build', done));
gulp.task('hugo:build', done => {
  const assets = require('./build/assets-manifest.json');
  const args = production
    ? ['-d', `${__dirname}/build`, '-s', 'src/hugo']
    : [
        '-d',
        `${__dirname}/build`,
        '-s',
        'src/hugo',
        '--buildDrafts',
        '--buildFuture',
      ];
  fs.writeFile(
    'src/hugo/data/assets.json',
    JSON.stringify(assets),
    'utf8',
    err => {
      if (err) {
        $.util.log('[hugo:build]', chalk.red(err));
        return done();
      }
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
    }
  );
});
gulp.task('hugo:clean', () =>
  del([
    'build/**',
    '!build',
    '!build/static/**',
    '!build/assets-manifest.json',
    '!build/favicon.{ico,png}',
  ])
);

gulp.task('all', done => runSequence('all:clean', 'all:build', done));
gulp.task('all:build', done =>
  runSequence('public:build', 'assets:build', 'hugo:build', done)
);
gulp.task('all:clean', () => del(['build']));

gulp.task('server', ['all'], () => {
  browserSync.init({
    server: {
      baseDir: 'build',
    },
    open: false,
    notify: false,
    middleware: [
      require('webpack-dev-middleware')(compiler, {
        publicPath: webpackConfig.output.publicPath,
        stats: { colors: true },
      }),
      require('webpack-hot-middleware')(compiler),
    ],
  });

  gulp.watch(['src/hugo/**/*.{json,md,html}'], ['hugo']);
  gulp.watch(['public/**/*'], ['public']);
});
