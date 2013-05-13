'use strict';

require.config({
  paths: {
    json2: '../vendor/json2',
    jquery: '../../components/jquery/jquery',
    jqueryui: '../../components/jquery-ui-custom/jquery-ui-1.10.2.custom',
    'jqueryui-layout': '../../components/jquery-ui-layout/jquery.layout-latest',
    handlebars: '../../components/handlebars.js/handlebars.runtime',
    JST: 'templates',
    underscore: '../../components/underscore/underscore',
    backbone: '../../components/backbone/backbone',
    'socket.io': 'core/socket.io-shim',
    bootstrap: '../vendor/bootstrap',
    validator: '../vendor/validator',
    // validators: 'core/validators/index', // can't use this as modules contain module-relative requires
    // errorTypes: 'core/errorTypes', // can't use this as modules contain module-relative requires
  },
  shim: {
    json2: {
      exports: 'JSON',
    },
    jquery: {
      deps: [],
      exports: '$',
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
    },
  }
});

require(['app', 'socket.io', 'core/validators/index', 'core/errorTypes'], function (App, io, val, err) {
  var app = new App();
  io.init(app);

  window.app = app;
  console.log('TODO: Unset window.app');
  console.log('TODO: Unset window.bootstrap');

  window.val = val;
  window.err = err;
});

