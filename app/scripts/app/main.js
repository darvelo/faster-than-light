require.config({
    paths: {
        jquery: '../../components/jquery/jquery',
        handlebars: '../../components/handlebars/handlebars.runtime',
        JST: 'templates',
        underscore: '../../components/underscore/underscore',
        backbone: '../../components/backbone/backbone',
        layoutmanager: '../../components/backbone.layoutmanager/backbone.layoutmanager',
        bootstrap: '../vendor/bootstrap',
        validator: '../vendor/validator',
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

require(['app'], function (App) {
  'use strict';

  window.app = new App();
});

