var config = require('../config');
var gulp = require('gulp');
var webpack = require('webpack');
var gutil = require('gulp-util');
var path = require('path');
var eslint = require('gulp-eslint');

var lint = function () {
  return gulp.src(path.join(config.webpack.entry.bundle, '../**/*.js'))
  .pipe(eslint())
  .pipe(eslint.format());
}

var once = function (fn) {
  var done = false;
  return function() {
    if (!done) {
      done = true;
      fn();
    }
  };
}

function checkErrors(err, stats) {
  if (err) {
    throw new gutil.PluginError('webpack', err);
    gutil.log('[webpack]', stats.toString());
  }
  if (stats.compilation.errors.length) {
    gutil.log(stats.compilation.errors[0].toString());
  }
}

gulp.task('webpack:lint', lint);

gulp.task('webpack', ['webpack:lint'], function(done) {
  var oncedone = once(done);
  if (config.watch) {
    webpack(config.webpack).watch(200, function(err, stats) {
      checkErrors(err, stats);
      gutil.log(gutil.colors.cyan('webpack'), 'task watching files...');
      oncedone();
    });
  } else {
    webpack(config.webpack, function(err, stats) {
      checkErrors(err, stats);
      oncedone();
    });
  }
});
