/*jshint indent:4*/
// Generated on 2013-05-01 using generator-webapp 0.1.7
'use strict';
var path = require('path');
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var yeomanConfig = {
        app: 'app',
        dist: 'dist'
    };

    grunt.initConfig({
        yeoman: yeomanConfig,
        watch: {
            // coffee: {
            //     files: ['<%= yeoman.app %>/scripts/{,*/}*.coffee'],
            //     tasks: ['coffee:dist']
            // },
            // coffeeTest: {
            //     files: ['test/spec/{,*/}*.coffee'],
            //     tasks: ['coffee:test']
            // },
            compass: {
                files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
                tasks: ['compass:server'],
                options: {
                    // livereload: false,
                    nospawn: true,
                },
            },
            handlebars: {
                files: [
                    '<%= yeoman.app %>/scripts/app/rawTemplates/**/*.hbs',
                ],
                tasks: ['handlebars:app'],
                options: {
                    livereload: true
                },
            },
            scripts: {
                files: [
                    '<%= yeoman.app %>/scripts/**/*.js',
                ],
                // tasks: ['noop'],
                options: {
                    livereload: true
                },
            },
            css: {
                files: [
                    '{.tmp,<%= yeoman.app %>}/styles/**/*.css',
                ],
                // tasks: ['noop'],
                options: {
                    livereload: true
                },
            },
            images: {
                files: [
                    '<%= yeoman.app %>/images/**/*.{png,jpg,jpeg,webp}'
                ],
                // tasks: ['noop'],
                options: {
                    livereload: true
                },
            },
        },
        connect: {
            options: {
                port: 9000,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, 'app')
                        ];
                    }
                }
            },
            test: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, 'test')
                        ];
                    }
                }
            },
            dist: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, 'dist')
                        ];
                    }
                }
            }
        },
        open: {
            server: {
                path: 'http://localhost:<%= connect.options.port %>'
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*'
                    ]
                }]
            },
            server: ['.tmp', '<%= yeoman.app %>/scripts/app/templates'],
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.app %>/scripts/**/*.js',
                '!<%= yeoman.app %>/scripts/vendor/*',
                'test/spec/**/*.js'
            ]
        },
        mocha: {
            all: {
                options: {
                    run: true,
                    urls: ['http://localhost:<%= connect.options.port %>/index.html']
                }
            }
        },
        coffee: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/scripts',
                    src: '{,*/}*.coffee',
                    dest: '.tmp/scripts',
                    ext: '.js'
                }]
            },
            test: {
                files: [{
                    expand: true,
                    cwd: 'test/spec',
                    src: '{,*/}*.coffee',
                    dest: '.tmp/spec',
                    ext: '.js'
                }]
            }
        },
        compass: {
            options: {
                sassDir: '<%= yeoman.app %>/styles',
                cssDir: '.tmp/styles',
                imagesDir: '<%= yeoman.app %>/images',
                javascriptsDir: '<%= yeoman.app %>/scripts',
                fontsDir: '<%= yeoman.app %>/styles/fonts',
                importPath: 'app/components',
                relativeAssets: true
            },
            dist: {},
            server: {
                options: {
                    debugInfo: true
                }
            }
        },
        // not used since Uglify task does concat,
        // but still available if needed
        /*concat: {
            dist: {}
        },*/
        requirejs: {
            app: {
                // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
                options: {
                    // `name` and `out` is set by grunt-usemin
                    baseUrl: 'app/scripts/app',
                    paths: {
                        json2: '../vendor/json2',
                        jquery: '../../components/jquery/jquery',
                        jqueryui: '../../components/jquery-ui-custom/jquery-ui-1.10.2.custom',
                        'jqueryui-layout': '../../components/jquery-ui-layout/jquery.layout-latest',
                        handlebars: '../../components/handlebars.js/handlebars.runtime',
                        // templates are compiled from '/.tmp'!
                        // in dev, express handles mapping that to '/scripts/app/templates'
                        JST: '../../../.tmp/scripts/app/templates',
                        underscore: '../../components/underscore/underscore',
                        backbone: '../../components/backbone/backbone',
                        // use 'empty:' if you're trying to serve live.
                        // But serving a local file makes builds easier.
                        // http://stackoverflow.com/questions/15917144/is-there-a-way-to-lazily-set-the-path-of-a-resource-with-requirejs/16290910#16290910
                        // socketio: 'empty:',
                        'socket.io': 'core/socket.io-shim',
                        bootstrap: '../vendor/bootstrap',
                        validator: '../vendor/validator',
                    },
                    shim: {
                        json2: {
                            deps: [],
                            exports: 'JSON',
                        },
                        jqueryui: {
                            deps: [
                                'jquery',
                            ],
                        },
                        'jqueryui-layout': {
                            deps: [
                                'jquery',
                                'jqueryui',
                            ],
                        },
                        handlebars: {
                            deps: [],
                            exports: 'Handlebars'
                        },
                        underscore: {
                            deps: [],
                            exports: '_',
                            init: function () {
                                return this._.noConflict();
                            },
                        },
                        backbone: {
                            deps: ['jquery', 'underscore'],
                            exports: 'Backbone',
                            init: function (jquery, underscore) {
                                return this.Backbone.noConflict();
                            },
                        },
                        bootstrap: {
                            deps: ['jquery'],
                        }
                    },
                    optimize: 'uglify2',
                    // TODO: Figure out how to make sourcemaps work with grunt-usemin
                    // https://github.com/yeoman/grunt-usemin/issues/30
                    //generateSourceMaps: true,
                    // required to support SourceMaps
                    // http://requirejs.org/docs/errors.html#sourcemapcomments
                    preserveLicenseComments: false,
                    useStrict: true,
                    wrap: true,
                    //uglify2: {} // https://github.com/mishoo/UglifyJS2

                    // use almond in production
                    // https://github.com/asciidisco/grunt-requirejs/blob/master/docs/almondIntegration.md
                    almond: true,
                    replaceRequireScript: [{
                        files: ['dist/index.html'],
                        module: 'main'
                    }]
                }
            },
            profile: {
                // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
                options: {
                    // `name` and `out` is set by grunt-usemin
                    baseUrl: 'app/scripts/profile',
                    optimize: 'uglify2',
                    // TODO: Figure out how to make sourcemaps work with grunt-usemin
                    // https://github.com/yeoman/grunt-usemin/issues/30
                    //generateSourceMaps: true,
                    // required to support SourceMaps
                    // http://requirejs.org/docs/errors.html#sourcemapcomments
                    preserveLicenseComments: false,
                    useStrict: true,
                    wrap: true,
                    //uglify2: {} // https://github.com/mishoo/UglifyJS2

                    // use almond in production
                    // https://github.com/asciidisco/grunt-requirejs/blob/master/docs/almondIntegration.md
                    almond: true,
                    replaceRequireScript: [{
                        files: ['dist/index.html'],
                        module: 'main'
                    }]
                }
            }
        },
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= yeoman.dist %>/scripts/{,*/}*.js',
                        '<%= yeoman.dist %>/styles/{,*/}*.css',
                        '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
                        '<%= yeoman.dist %>/styles/fonts/*'
                    ]
                }
            }
        },
        useminPrepare: {
            html: '<%= yeoman.app %>/usemin.html',
            options: {
                dest: '<%= yeoman.dist %>'
            }
        },
        usemin: {
            html: ['<%= yeoman.dist %>/{,*/}*.html'],
            css: ['<%= yeoman.dist %>/styles/**/*.css'],
            options: {
                dirs: ['<%= yeoman.dist %>']
            }
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '**/*.{png,jpg,jpeg}',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        cssmin: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/styles/main.css': [
                        // '.tmp/styles/**/*.css',
                        // '<%= yeoman.app %>/styles/**/*.css'
                        '.tmp/styles/main.css',
                    ],
                    '<%= yeoman.dist %>/styles/app.css': [
                        '.tmp/styles/app.css',
                    ]
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
                    /*removeCommentsFromCDATA: true,
                    // https://github.com/yeoman/grunt-usemin/issues/44
                    //collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true*/
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>',
                    src: '*.html',
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },
        // Put files not handled in other tasks here
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,txt}',
                        '.htaccess',
                        'images/**/*.{webp,gif}',
                        'styles/fonts/*'
                    ]
                }]
            }
        },
        concurrent: {
            express: {
                options: {
                    logConcurrentOutput: true,
                },
                tasks: [
                    'nodemon:exec',
                    'watch',
                ],
            },
            nodemon: {
                options: {
                    logConcurrentOutput: true,
                },
                tasks: [
                    'nodemon:dev',
                    'nodemon:exec',
                    'watch',
                ],
            },
            server: [
                // 'coffee:dist',
                'compass:server',
                'handlebars:app',
            ],
            test: [
                'coffee',
                'compass',
                'handlebars:app',
            ],
            dist: [
                'coffee',
                'compass:dist',
                'handlebars:app',
                'imagemin',
                'svgmin',
                // 'htmlmin'
            ]
        },
        bower: {
            options: {
                exclude: ['modernizr']
            },
            all: {
                rjsConfig: '<%= yeoman.app %>/scripts/main.js'
            }
        },
        uglify: {
            options: {
                mangle: {
                    sort: true,
                    toplevel: false,
                    eval: true,
                    except: ['jQuery', 'Backbone', '$', '_'],
                },
                compress: true,
                report: 'min',
                wrap: true,
                preserveComments: false,
//                    beautify: true,
//                    sourceMap: '<%= yeoman.dist %>/scripts/source-map.js'
            },
            dist: {
                // files: {
                //     '<%= yeoman.dist %>/scripts/randomscript.js': ['<%= yeoman.dist %>/scripts/randomscript.js']
                // },
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>/scripts/misc',
                    dest: '<%= yeoman.dist %>/scripts/misc',
                    src: '**/*.js',
                }]
            }
        },
        handlebars: {
            app: {
                options: {
                    namespace: false,
                    amd: true,
                    processContent: function(content) {
                        content = content.replace(/^[\x20\t]+/mg, '').replace(/[\x20\t]+$/mg, '');
                        content = content.replace(/^[\r\n]+/, '').replace(/[\r\n]*$/, '\n');
                        return content;
                    }
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/scripts/app/rawTemplates/',
                    src: ['**/*.hbs'],
                    dest: '.tmp/scripts/app/templates/',
                    ext: '.js',
                }],
            },
        },
        express: {
            custom: {
                options: {
                    hostname: 'localhost',
                    port: 9000,
                    debug: true,
                    'debug-brk': 5858,
                    // bases: ['.tmp', 'app'],
                    server: path.resolve('./zero.js'),
                    monitor: {
                        // 'silent': false,
                        // 'pidFile': path.resolve('.') + 'zero.pid',
                        // 'killTree': true,
                        // 'watch': true,
                        // // 'watchIgnorePatterns': ['app/', 'dist/', 'test/', '.tmp', 'temp/'],
                        // 'watchDirectory': path.resolve('.'),
                    }
                }
            }
        },
        nodemon: {
            dev: {
                options: {
                    file: 'zero.js',
                    args: ['dev'],
                    watchedExtensions: [
                        'js',
                        // 'coffee'
                    ],
                    watchedFolders: ['.'],
                    debug: true,
                    delayTime: 1,
                    ignoredFiles: [
                        'README.md',
                        'Gruntfile.js',
                        '/.git/',
                        '/node_modules/',
                        '/app/',
                        '/dist/',
                        '/test/',
                        '/temp/',
                        '/.tmp',
                        '/.sass-cache',
                        '*.txt',
                        '*.sublime-project',
                        '*.sublime-workspace',
                        '*.jade',
                    ],
                }
            },
            exec: {
                options: {
                    file: './node-inspector.js',
                    exec: 'node-inspector',
                    ignoredFiles: [
                        'README.md',
                        'Gruntfile.js',
                        '/.git/',
                        '/node_modules/',
                        '/app/',
                        '/dist/',
                        '/test/',
                        '/temp/',
                        '/.tmp',
                        '/.sass-cache',
                        '*.txt',
                        '*.sublime-project',
                        '*.sublime-workspace',
                        '*.jade',
                    ],
                },
            },
        },
    });

    grunt.registerTask('noop', []);

    grunt.registerTask('serva-express', [
        'concurrent:server',
        'express',
        // won't work. node-inspector won't catch the express process
        // 'concurrent:express',
        'watch',
        // not needed if watch comes before or after. it'll keep the grunt process running
        // 'express-keepalive',
        // 'open',
    ]);

    grunt.registerTask('serva-nodemon', [
        'concurrent:server',
        'concurrent:nodemon',
    ]);

    grunt.registerTask('server', function (target) {
        // not using grunt in production
        // if (target === 'dist') {
        //     return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
        // }

        grunt.task.run([
            'clean:server',
            'concurrent:server',
            'connect:livereload',
            'open',
            'watch',
        ]);
    });

    grunt.registerTask('test', [
        'clean:server',
        'concurrent:test',
        'connect:test',
        'mocha'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'concurrent:dist',
        'uglify:dist',
        'useminPrepare',

        'cssmin',
        'concat',
        'uglify',
        'copy',

        // Any other requirejs 'sub-projects' can be
        // compiled with 'requirejs:subprojectName'
        'requirejs:app',

        // 'rev',
        'usemin'
    ]);

    grunt.registerTask('default', [
        'jshint',
        'test',
        'build'
    ]);
};
