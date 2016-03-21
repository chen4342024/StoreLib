module.exports = function (config) {
    config.set({
        browsers  : ['Chrome'],
        frameworks: ['jasmine'],
        files     : [
            'src/**/*.js',
            'test/**/*.spec.js'
        ],

        //配置输出方式
        reporters: ['progress', 'kjhtml', 'coverage'],

        //html格式输出
        htmlReporter: {
            outputDir              : 'karma_html', // where to put the reports
            templatePath           : null, // set if you moved jasmine_template.html
            focusOnFailures        : true, // reports show failures on start
            namedFiles             : false, // name files instead of creating sub-directories
            pageTitle              : null, // page title for reports; browser info by default
            urlFriendlyName        : false, // simply replaces spaces with _ for files/dirs
            preserveDescribeNesting: false, // folded suites stay folded
            foldAll                : false, // reports start folded (only with preserveDescribeNesting)
        },

        port: 9877,

        //配置覆盖的路径
        //preprocessors: {
        //    'src/**/*.js': 'coverage'
        //},

        //不配置覆盖的路径的话，可以查看源码和断点调试
        preprocessors: {
            'src/**/*.js': []
        },

        //配置检查覆盖率的输出
        coverageReporter: {
            type: 'html',
            dir : 'test_out/coverage/'
        },
        //修复改变文件是会触发删除的bug
        usePolling      : true
    });
};
