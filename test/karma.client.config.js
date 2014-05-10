// Karma configuration
// Generated on Tue Feb 18 2014 13:08:43 GMT-0600 (CST)

module.exports = function (karma) {
  karma.set({

    // base path, that will be used to resolve files and exclude
    basePath: 'client',


    // frameworks to use
    frameworks: ['jasmine'],

    files: [

    /******* Test Libraries ******************/
      '../../node_modules/karma-handlebars-preprocessor/node_modules/handlebars/dist/handlebars.runtime.js',
      '../../node_modules/jasmine-jquery/lib/jasmine-jquery.js',
      'lib/**/*.js',
      'lib/*.js',

    /******* Core Dependencies ******************/
      '../../public/js/*.js',      

    /******* Test Fixtures ******************/
      {
        pattern: 'fixtures/*.html',
        watched: false,
        served: true,
        included: false
      },

    /******* Jasmine Tests ******************/
      "jasmine-tests/*.js"

    ],

    coverageReporter: {
      type : 'html',
      dir : 'coverage/'
    },
    // list of files to exclude
    exclude: [

    ],

    preprocessors: {
      // define which files to include in coverage reports
      '../../public/js/*.js': 'coverage'
    },       

    // use dots reporter, as travis terminal does not support escaping sequences
    // possible values: 'dots', 'progress'
    // CLI --reporters progress
    reporters: ['progress', 'coverage'],

    // web server port
    // CLI --port 9876
    port: 9876,

    // cli runner port
    runnerPort: 9100,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: karma.LOG_DISABLE || karma.LOG_ERROR || karma.LOG_WARN || karma.LOG_INFO || karma.LOG_DEBUG
    logLevel: karma.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true
  });
};
