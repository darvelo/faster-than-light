require.config({
    baseUrl: '/app/scripts/app',
    paths: {
        json3: '../../components/json3/lib/json3',
        jquery: '../../components/jquery/jquery',
        jqueryui: '../../components/jquery-ui-custom/jquery-ui-1.10.2.custom',
        'jqueryui-layout': '../../components/jquery-ui-layout/jquery.layout-latest',
        // needed for precompiled templates
        handlebars: '../../components/handlebars.js/handlebars.runtime',
        JST: 'templates',
        underscore: '../../components/lodash/dist/lodash.compat',
        backbone: '../../components/backbone/backbone',
        'socket.io': 'core/socket.io-shim',
        bootstrap: '../vendor/bootstrap',
        validator: '../vendor/validator',
        tests: '/test/browser/require-tests',
    },
    shim: {
        // i've turned the jqueryui and jqueryui-layout modules into AMD
        // so they'll get the jQuery handle without it being on window.$
        /*
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
        */
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
