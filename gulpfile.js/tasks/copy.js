var config = require('../config');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var lazypipe = require('lazypipe');
var path = require('path');
var gutil = require('gulp-util');
var useref = require('gulp-useref');
var changed = require('gulp-changed');
var watch = require('gulp-watch');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var eslint = require('gulp-eslint');

gulp.task('copy', function(done) {
  const srcFiles = [
    path.join(config.src, '**/**'),
    '!' + path.join(config.src, 'bundles/**'),
    '!' + path.join(config.src, 'AppxManifest.xml'),
    '!' + path.join(config.src, '**/.*')
  ];

  const doJS = lazypipe()
    .pipe(eslint)
    .pipe(eslint.format)

  const doScss = lazypipe()
    .pipe(sourcemaps.init)
    .pipe(sass, config.sass.settings)
    .pipe(autoprefixer, { browsers: ['last 2 version'] })
    .pipe(sourcemaps.write);

  // Seems to be necessary
  const doWatch = config.watch
    ? lazypipe().pipe(watch, srcFiles)
    : lazypipe().pipe(gutil.noop);


  if (config.watch) {
    gutil.log(gutil.colors.cyan('copy'), 'task watching files...');
  }

  return gulp.src(srcFiles)
    //.pipe(gulpif(argv.watch, doWatch()))
    .pipe(doWatch())
    .pipe(changed(config.dest))
    .pipe(gulpif('*.scss', doScss()))
    .pipe(gulpif('*.js', doJS()))
    .pipe(gulp.dest(config.dest))

  done();
});
