require.config({
    baseUrl: '/app/scripts/app',
    paths: {
        jquery: '../../components/jquery/jquery',
        jqueryui: '../../components/jquery-ui-custom/jquery-ui-1.10.2.custom',
        'jqueryui-layout': '../../components/jquery-ui-layout/jquery.layout-latest',
        handlebars: '../../components/handlebars/handlebars.runtime',
        JST: '/.tmp/scripts/app/templates',
        underscore: '../../components/underscore/underscore',
        backbone: '../../components/backbone/backbone',
        'socket-io': '../vendor/socket.io-client',
        bootstrap: '../vendor/bootstrap',
        validator: '../vendor/validator',
        tests: '/test/browser/require-tests',
    },
    shim: {
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
            exports: '_'
        },
        backbone: {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
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
