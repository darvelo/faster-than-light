require.config({
  paths: {
    jquery: '../../components/jquery/jquery',
    jqueryui: '../../components/jquery-ui-custom/jquery-ui-1.10.2.custom',
    'jqueryui-layout': '../../components/jquery-ui-layout/jquery.layout-latest',

    handlebars: '../../components/handlebars/handlebars.runtime',
    JST: 'templates',
    underscore: '../../components/underscore/underscore',
    backbone: '../../components/backbone/backbone',
    layoutmanager: '../../components/backbone.layoutmanager/backbone.layoutmanager',
    bootstrap: '../vendor/bootstrap',
    validator: '../vendor/validator',
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

