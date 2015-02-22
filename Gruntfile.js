module.exports = function(grunt) {

    grunt.initConfig({
        jsbeautifier: {
            files: [
                "Gruntfile.js",
                "src/**/*.js",
                "test/index.js",
                "test/index.min.js",
                "test/server.js"
            ]
        },
        jshint: {
            options: {
                es3: true,
                unused: true,
                curly: false,
                eqeqeq: true,
                expr: true,
                eqnull: true,
                proto: true
            },
            files: [
                "Gruntfile.js",
                "src/**/*.js",
                "test/index.js",
                "test/server.js"
            ]
        }
    });

    grunt.loadNpmTasks("grunt-jsbeautifier");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.registerTask("default", ["jsbeautifier", "jshint"]);
};
