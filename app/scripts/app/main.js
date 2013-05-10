require.config({
  paths: {
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
    'socket-io': {
      exports: 'io',
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

require(['app', 'socket.io', 'core/validators/index', 'core/errorTypes'], function (App, io, val, err) {
  'use strict';

  var app = new App();
  io.init(app);

  window.app = app;
  console.log('TODO: Unset window.app');
  console.log('TODO: Unset window.bootstrap');

  window.val = val;
  window.err = err;
});

