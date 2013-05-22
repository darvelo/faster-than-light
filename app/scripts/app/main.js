'use strict';

require.config({
  paths: {
    json2: '../vendor/json2',
    jquery: '../../components/jquery/jquery',
    jqueryui: '../../components/jquery-ui-custom/jquery-ui-1.10.2.custom',
    'jqueryui-layout': '../../components/jquery-ui-layout/jquery.layout-latest',
    handlebars: '../../components/handlebars.js/handlebars.runtime',
    JST: 'templates',
    underscore: '../../components/lodash/lodash',
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
      exports: '_',
    },
    backbone: {
      deps: ['jquery', 'underscore'],
      exports: 'Backbone',
    },
    bootstrap: {
      deps: ['jquery'],
    },
  }
});

require(['app', 'jquery'], function (App, $) {
  $(document).ready(function () {
    var app = new App();

    window.app = app;
    console.log('TODO: Unset window.app');
    console.log('TODO: Unset window.bootstrap');
  });
});

