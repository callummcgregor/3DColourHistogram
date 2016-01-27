// Karma configuration
// Generated on Tue Jan 26 2016 13:56:56 GMT+0000 (GMT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: 'Development/Histogram/',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['qunit'],


    // list of files / patterns to load in the browser
    files: [
      // Required, as the html and js must compile to be able to test the classes
      'https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js',
      'https://cdn.rawgit.com/mrdoob/three.js/master/build/three.min.js',
      'https://cdn.rawgit.com/mrdoob/three.js/master/examples/js/controls/OrbitControls.js',
      {pattern: 'src/*.html', included: false},
      {pattern: 'src/*.js', included: true},
      {pattern: 'test/*Test.js', included: true}
    ],


    // list of files to exclude
    exclude: [
    ],

    plugins: [
      "karma-qunit",
      "karma-chrome-launcher",
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
