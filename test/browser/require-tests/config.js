require.config({
    baseUrl: "/app/scripts/app",
    paths: {
        jquery: '../../components/jquery/jquery',
        handlebars: '../../components/handlebars/handlebars.runtime',
        JST: 'templates',
        underscore: '../../components/underscore/underscore',
        backbone: '../../components/backbone/backbone',
        layoutmanager: '../../components/backbone.layoutmanager/backbone.layoutmanager',
        bootstrap: '../vendor/bootstrap',
        validator: '../vendor/validator',
        tests: '/test/browser/require-tests'
    },
    shim: {
        handlebars: {
            deps: [],
            exports: 'Handlebars'
        },
        underscore: {
            deps: [],
            exports: '_'
        },
        backbone: {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
        },
        layoutmanager: {
            deps: ['backbone'],
            exports: 'Backbone.Layout'
        },
        bootstrap: {
            deps: ['jquery'],
            exports: 'jquery'
        }
    }
});

// Protect from barfs
console = window.console || function() {};

// Don't track
window.notrack = true;

// Mocha run helper, used for browser
var runMocha = function() {
    mocha.run();
};
