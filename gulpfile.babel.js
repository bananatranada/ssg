import fs from 'fs';
import cprocess from 'child_process';
import _ from 'lodash';
import gulp from 'gulp';
import del from 'del';
import runSequence from 'run-sequence';
import requireDir from 'require-dir';
import chalk from 'chalk';
import webpack from 'webpack';
import cssnext from 'postcss-cssnext';

const $ = require('gulp-load-plugins')();
const browserSync = require('browser-sync').create();
const production = process.env.NODE_ENV === 'production';

const webpackConfig = production
  ? require('./webpack.config.prod.js')
  : require('./webpack.config.dev.js');
const compiler = webpack(webpackConfig);

let hot = true;
// compiler.plugin('done', () => {
//   if (!hot) {
//     hot = true;
//     browserSync.reload();
//   }
// });

gulp.task('scss', done => runSequence('scss:clean', 'scss:build', done));
gulp.task('scss:build', () =>
  gulp
    .src('src/scss/main.scss')
    .pipe($.if(production, $.sourcemaps.init()))
    .pipe(
      $.sass({ includePaths: ['./node_modules'] }).on('error', $.sass.logError)
    )
    .pipe($.postcss([cssnext]))
    .pipe($.if(production, $.cleanCss()))
    .pipe($.if(production, $.rev()))
    .pipe($.if(production, $.sourcemaps.write('.')))
    .pipe(gulp.dest('build/static/assets/css'))
    .pipe($.if(!production, browserSync.stream()))
    // .src('build/static/assets/css/*.css', { base: 'build' })
    .pipe($.if(production, $.rev.manifest('css-manifest.json')))
    .pipe(gulp.dest('build'))
);
gulp.task('scss:clean', () => del('build/static/assets/css/**'));

gulp.task('js', done => runSequence('js:clean', 'js:build', done));
gulp.task('js:build', done => {
  const config = production
    ? require('./webpack.config.prod.js')
    : require('./webpack.config.dev.js');
  const compiler = webpack(config, (err, stats) => {
    if (err) {
      console.log(chalk.red('[js:build]\n' + err));
      return done();
    }
    $.util.log('[webpack]', stats.toString({ colors: true, progress: true }));
    if (!production) {
      browserSync.reload();
    }
    done();
  });
  // compiler.plugin('done' () => console.log('yo'));
});
gulp.task('js:clean', () => del('build/static/assets/js/**'));

gulp.task('public', done => runSequence('all:clean', 'all:build', done));
gulp.task('public:build', () => {
  return gulp.src('public/**/*').pipe($.imagemin()).pipe(gulp.dest('build'));
});

// read build/asset-manifest.json after webpack finishes
gulp.task('hugo', done => runSequence('all:clean', 'all:build', done));
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
        console.log(chalk.red('[hugo:build]\n' + err));
        return done();
      }
      cprocess.spawn('hugo', args, { stdio: 'inherit' }).on('close', code => {
        if (code === 0) {
          if (!production) {
            browserSync.reload();
          }
        } else {
          onError('Unable to start hugo process. Code ' + code);
        }
        done();
      });
    }
  );
});

gulp.task('all', done =>
  runSequence('all:clean', 'public:build', 'js:build', 'hugo:build', done)
);
// gulp.task('all', ['scss', 'js', 'hugo', 'public']);
gulp.task('all:build', [
  'public:build',
  // 'scss:build',
  // 'js:build',
  'hugo:build',
]);
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
      require('webpack-hot-middleware')(compiler, {
        reload: true,
      }),
    ],
  });

  // full refresh on js changes; required  because we want to refresh AFTER it gets bundled
  gulp.watch(['src/js/**/*'], () => {
    hot = false;
  });
  gulp.watch(['src/hugo/**/*'], ['hugo']);
  gulp.watch(['src/public/**/*'], ['public']);
});
