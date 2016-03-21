var gulp = require('gulp'),
    server = require('karma').Server,
    jasmine = require('gulp-jasmine');

gulp.task('default', function() {
    // 将你的默认的任务代码放在这
});


/**
 * Run test once and exit
 */
gulp.task('test', function(done) {
    var karma = new server({
        singleRun: false,
        configFile: __dirname + '/karma.conf.js'
    }, done);
    karma.start();
});

/**
 * Watch for file changes and re-run tests on each change
 */
gulp.task('tdd', function(done) {
    karma.start({
        configFile: __dirname + '/karma.conf.js'
    }, done);
});

