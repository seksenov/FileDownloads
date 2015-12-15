var gulp = require('gulp');
var config = require('../config');
var path = require('path');
var os = require('os');

var hwa = null;
if (os.platform() === 'win32') {
  try {
    hwa = require('hwa');
  } catch (err) {
    console.log(err);
  }
}

gulp.task('appx', function(done) {
  if (hwa) {
    hwa.registerApp(path.resolve(config.appx.src));
  } else {
    console.log('You need to be running Windows 10 launch the app');
  }

  done();
});
