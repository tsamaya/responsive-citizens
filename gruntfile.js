/*global module:false*/
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
    return connect['static'](require('path').resolve(dir));
};
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    jshint: {
      options: {
        jshintrc: true
      },
      all: ['src/app/**/*.js']
    },

    connect: {
      options: {
        port:9000
      },
      // load unbuilt code w/ livereload
      unbuilt: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, './src/')
            ];
          }
        }
      },
      // load built app
      build: {
        options: {
          base: 'dist',
          // change this to '0.0.0.0' to access the server from outside
          hostname: 'localhost'
        }
      }
    },

    //Open default browser at the app
    open: {
      unbuilt: {
        path: 'http://localhost:<%= connect.options.port %>/'
      },
      build: {
        path: 'http://localhost:<%= connect.options.port %>/'
      }
    },
    //setup watch tasks
    watch: {
      options: {
        nospan: true,
        livereload: LIVERELOAD_PORT
      },

      source: {
        files: ['./src/js/**/*.js'],
        tasks: ['jshint']
      },
      livereload:{
        options: {
          livereload:LIVERELOAD_PORT
        },
        files:[
          './src/js/**/*.js',
          './src/**/*.html',
          './src/css/**/*.css'
        ]
      }
    },
    esri_slurp: {
      options: {
        version: '3.12'
      },
      dev: {
        options: {
          beautify: false
        },
        dest: 'src/esri'
      }
    },
    // clean the output directory before each build
    clean: {
      build: ['dist'],
      deploy: ['dist/**/*.consoleStripped.js','dist/**/*.uncompressed.js','dist/**/*.js.map'],
      bower: ['src/bootstrap-map-js', 'src/dijit', 'src/dojo', 'src/dojo-bootstrap', 'src/dojox', 'src/put-selector', 'src/util', 'src/xstyle'],
      slurp: ['src/esri']
    },
    // dojo build configuration, mainly taken from dojo boilerplate
    dojo: {
      dist: {
        options: {
          profile: 'profiles/app.profile.js' // Profile for build
        }
      },
      options: {
        dojo: 'src/dojo/dojo.js', // Path to dojo.js file in dojo source
        load: 'build', // Optional: Utility to bootstrap (Default: 'build')
        // profiles: [], // Optional: Array of Profiles for build
        // appConfigFile: '', // Optional: Config file for dojox/app
        // package: '', // Optional: Location to search package.json (Default: nothing)
        // packages: [], // Optional: Array of locations of package.json (Default: nothing)
        // require: '', // Optional: Module to require for the build (Default: nothing)
        // requires: [], // Optional: Array of modules to require for the build (Default: nothing)
        releaseDir: '../dist', // Optional: release dir rel to basePath (Default: 'release')
        cwd: './', // Directory to execute build within
        // dojoConfig: '', // Optional: Location of dojoConfig (Default: null),
        // Optional: Base Path to pass at the command line
        // Takes precedence over other basePaths
        // Default: null
        basePath: './src'
      }
    },
    processhtml: {
      build: {
        files: {
          'dist/index.html': ['src/index.html']
        }
      }
    },
    copy: {
      build: {
        src: 'src/dashboard.html',
        dest: 'dist/dashboard.html'
      }
    },
    'gh-pages': {
      src: {
        options: {
          base: 'src'
        },
        src: ['index.html', 'dashboard.html', 'app/**']
      },
      dist: {
        options: {
          base: 'dist'
        },
        src: ['index.html', 'dashboard.html', 'app/css/**', 'dojo/dojo.js', 'dojo/resources/**', 'esri/images/**', 'esri/dijit/images/**', 'esri/dijit/font/**']
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-esri-slurp');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-dojo');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['serve']);

  grunt.registerTask('serve', function (target) {
    var trgt = target || 'unbuilt';
    grunt.task.run([
      'jshint',
      'connect:' + trgt,
      'open:' + trgt,
      'watch'
    ]);
  });

  grunt.registerTask('hint', ['jshint']);

  grunt.registerTask('slurp', ['clean:slurp', 'esri_slurp:dev']);

  grunt.registerTask('build', ['jshint', 'clean:build', 'dojo', 'processhtml', 'copy:build']);
};
