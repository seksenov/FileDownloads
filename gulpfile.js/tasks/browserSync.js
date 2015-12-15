var createBSync = require('browser-sync').create;
var config =  require('../config');
var gulp = require('gulp');
var browserSync = createBSync('AppX Server');
var argv = require('yargs');
var ngrok = require('ngrok');

gulp.task('browserSync', function(done) {
  config.watch = true;
  if (argv.ext) {
    ngrok.connect(config.ngrok, function(err, url) {
      if (err) {
        console.log(err);
      } else {
        console.log('external URL: ' + url);
      }
    });
  }
  browserSync.watch('./dist/**').on('change', browserSync.reload);
  browserSync.init(config.browserSync, done);
});
