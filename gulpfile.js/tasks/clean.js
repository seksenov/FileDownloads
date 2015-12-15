var gulp = require('gulp');
var config = require('../config');
var del = require('del');

gulp.task('clean', function(done) {
  del([config.clean.src], done);
});
